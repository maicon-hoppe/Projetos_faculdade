from typing import Annotated, Self, TypeAlias

import nltk
import numpy as np
import pandas as pd
from nltk.classify import ClassifierI, SklearnClassifier
from nltk.stem import RSLPStemmer, StemmerI
from numpy.typing import NDArray
from PIL import Image
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score
from sklearn.neural_network import MLPClassifier
from wordcloud import WordCloud


class TextClassifierBuilder:
    """Class to build a classifier model for texts"""

    Frac: TypeAlias = Annotated[float, "Between 0 and 1"]

    def __init__(self, model: ClassifierI) -> None:
        self.model = model

    def acquire_dataframe(
        self,
        df: pd.DataFrame,
        textColumn: str = "preprocessed_news",
        labelColumn: str = "label",
        shuffle: bool = True,
    ) -> Self:
        """
        Takes the dataframe that will be used to train the model and the
        names of the column containing the text and labels respectively.
        """

        self.df = df.sample(frac=1).reset_index(drop=True) if shuffle else df
        self.textColumn = textColumn
        self.labelColumn = labelColumn

        return self

    def create_tokenized_texts(self) -> Self:
        """
        Creates a list of tokens of each text in the dataframe.
        """

        self.tokenized_texts: NDArray = (
            self.df.loc[:, self.textColumn]
            .map(lambda news: nltk.word_tokenize(news, language="portuguese"))
            .to_numpy()
        )

        return self

    def stem_dataframe(self, stemmer: StemmerI, csv_out: bool = False) -> Self:
        """
        Stems the text in the dataframe
        """

        def aux(news):
            news_index = self.df.index[self.df[self.textColumn] == news]

            return " ".join(
                [
                    stemmer.stem(word)
                    for tokens in self.tokenized_texts[news_index]
                    for word in tokens
                ]
            )

        self.df.loc[:, self.textColumn] = self.df.loc[:, self.textColumn].map(aux)

        if csv_out:
            self.df.to_csv("stemmed.csv", index=False)

        return self

    def create_tf_idf(self) -> Self:
        """
        Creates a par with the td_idf vectorizer and the respective matrix
        of weights.
        """

        self.tf_idf = {}
        self.tf_idf["vectorizer"] = TfidfVectorizer(
            sublinear_tf=True, smooth_idf=True, use_idf=True
        )
        self.tf_idf["weights"] = self.tf_idf["vectorizer"].fit_transform(
            self.df[self.textColumn]
        )

        return self

    def create_feature_list(self) -> Self:
        """
        Create a list with pairs of features and labels for training a
        text model.
        """

        self.feature_list: list[tuple[pd.Series, str]] = []
        for idx in self.df[self.textColumn].index.to_list():
            features = {}
            for word in self.tokenized_texts[idx]:
                if word in self.tf_idf["vectorizer"].vocabulary_.keys():
                    features[word] = self.tf_idf["weights"][
                        idx, self.tf_idf["vectorizer"].vocabulary_[word]
                    ]

            self.feature_list.append(
                (
                    pd.Series(features),
                    self.df[self.labelColumn][idx],
                )
            )

        return self

    def return_trained_model(self, train_frac: Frac = 0.75) -> ClassifierI:
        """
        Return a trained nltk model.
        """

        self.sample_limit = int((len(self.feature_list) * train_frac) / 2)
        self.middle_point = len(self.df) // 2
        return self.model.train(
            self.feature_list[
                (self.middle_point - self.sample_limit) : (
                    self.middle_point + self.sample_limit
                )
            ]
        )


def main() -> None:
    df_news = pd.read_csv("Fake.br-Corpus/preprocessed/pre-processed.csv")
    # df_news = pd.read_csv("stemmed.csv")

    mlp = SklearnClassifier(
        MLPClassifier(
            (200,), alpha=0.001, max_iter=1000, warm_start=True, epsilon=1e-7
        ),
        dtype=np.float64,
        sparse=False,
    )

    builder = (
        TextClassifierBuilder(mlp)
        .acquire_dataframe(df_news)
        .create_tokenized_texts()
        .stem_dataframe(RSLPStemmer())
        .create_tf_idf()
        .create_feature_list()
    )
    feature_list = builder.feature_list
    trained_mlp = builder.return_trained_model()

    sample_limit = builder.sample_limit
    middle_point = builder.middle_point
    test_sample = (
        feature_list[: (middle_point - sample_limit)]
        + feature_list[(middle_point + sample_limit) :]
    )

    only_features = []
    for n in test_sample:
        only_features.append(n[0])

    only_labels = []
    for n in test_sample:
        only_labels.append(n[1])

    y_true = only_labels
    y_pred = trained_mlp.classify_many(only_features)

    print("Acurácia: ", accuracy_score(y_true, y_pred))

    true_count = 0
    fake_count = 0
    for feature in zip(only_features, y_pred):
        if feature[1] == "true":
            true_count += len(feature[0])
        else:
            fake_count += len(feature[0])

    print(f"Palavras verdadeiras: {true_count}")
    print(f"Palavras falsas: {fake_count}")

    real_words: dict[str, np.float64] = {}
    fake_words: dict[str, np.float64] = {}
    for feature in test_sample:
        if feature[1] == "true":
            real_words.update(feature[0])
        else:
            fake_words.update(feature[0])

    positive_img = np.array(Image.open("positive.jpg"))
    WordCloud(
        mask=positive_img, color_func=lambda *args, **kwargs: (0, 255, 0)
    ).generate_from_frequencies(real_words).to_file("true.jpg")

    negative_img = np.array(Image.open("negative.jpg"))
    WordCloud(
        mask=negative_img, color_func=lambda *args, **kwargs: (255, 0, 0)
    ).generate_from_frequencies(fake_words).to_file("fake.jpg")


if __name__ == "__main__":
    main()
