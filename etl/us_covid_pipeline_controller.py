import pandas as pd
from us_covid_transfrom import transform
from us_covid_adapters import notify_status, load

def handler(event, context):
    try:
        nyt_covid_data = pd.read_csv(
            "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"
        )
        jh_covid_data = pd.read_csv(
            "https://raw.githubusercontent.com/datasets/covid-19/master/data/time-series-19-covid-combined.csv"
        )
        df_result = transform(nyt_covid_data, jh_covid_data)
        load(df_result)
    except (Exception) as error:
        notify_status(f"The us-covid etl job failed: ${error}")
        print(error)