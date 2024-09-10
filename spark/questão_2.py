import pyspark.sql.functions as F
from pyspark.sql import DataFrame, SparkSession, types

app_name = "Questão 2"
master_url = "local"

spark: SparkSession = (
    SparkSession.builder.appName(app_name).master(master_url).getOrCreate()
)

imdb_schema = types.StructType(
    [
        types.StructField("id", types.IntegerType(), False),
        types.StructField("text_en", types.StringType(), False),
        types.StructField("text_pt", types.StringType(), False),
        types.StructField("sentiment", types.StringType(), False),
    ]
)

imdb_df = spark.read.csv(
    "imdb-reviews-pt-br.csv",
    header=True,
    quote='"',
    escape='"',
    encoding="UTF-8",
    schema=imdb_schema,
)


def map_text(df: DataFrame) -> DataFrame:
    avaliações = df.select(
        df.filter(df["sentiment"] == "neg")["text_en"],
        df.filter(df["sentiment"] == "neg")["text_pt"],
    )

    num_palavras = avaliações.rdd.map(
        lambda x: (len(x["text_en"].split()), len(x["text_pt"].split()))
    )
    num_palavras_df = num_palavras.toDF(avaliações.schema)

    avaliações_numeradas = avaliações.join(
        num_palavras_df.withColumnsRenamed(
            {"text_en": "length_en", "text_pt": "length_pt"}
        )
    )

    return avaliações_numeradas


def reduce_text(df: DataFrame) -> DataFrame:
    return df.agg(F.sum(df["length_en"]), F.sum(df["length_pt"]))


resultado = reduce_text(map_text(imdb_df)).collect()[0]

print("=" * 60)
print(f" A soma das palavras negativas em inglês é: {resultado[0]:n}")
print(f" A soma das palavras negativas em português é: {resultado[1]:n}")
print("=" * 60)
print(
    f" As avaliações negativas possuem {resultado[1] - resultado[0]:n} palavras a mais em\n português do que em inglês."
)
print("=" * 60)

spark.stop()
