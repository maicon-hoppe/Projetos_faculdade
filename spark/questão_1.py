import pyspark.sql.functions as F
from pyspark.sql import DataFrame, SparkSession, types

# Maicon Junior Hoppe (RU: 4388934)
app_name = "Questão 1"
master_url = "spark://192.168.1.102:7077"
# master_url = "local"

spark: SparkSession = SparkSession.builder.appName(app_name).master(master_url).getOrCreate()

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


def map_ids(x: DataFrame) -> DataFrame:
    return imdb_df.select(
        x.filter(x["sentiment"] == "neg")["id"],
        x.filter(x["sentiment"] == "neg")["sentiment"],
    )


def reduce_ids(x: DataFrame) -> DataFrame:
    return x.agg(F.sum(x["id"]))

resultado = reduce_ids(map_ids(imdb_df)).collect()[0]

print("=" * 40)
print(f" A soma dos IDs negativos é: {resultado[0]}")
print("=" * 40)


spark.stop()
