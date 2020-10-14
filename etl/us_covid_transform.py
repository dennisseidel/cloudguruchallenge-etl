import pandas as pd

def normalize_columnnames(dataframe):
  dataframe.columns = dataframe.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('(', '').str.replace(')', '')

def normalize_date(dataframe):
  dataframe['date'] = pd.to_datetime(dataframe['date'], format='%Y-%m-%d')
  return dataframe

def filter_us_only(dataframe):
    return dataframe.loc[dataframe['country/region'] == 'US']

def transform(nyt_covid_data, jh_covid_data):
  try:
    normalize_columnnames(jh_covid_data)
    normalize_date(nyt_covid_data)
    normalize_date(jh_covid_data)
    jh_us_covid_data = jh_covid_data[['date', 'recovered','country/region' ]]
    filter_us_only(jh_us_covid_data)
    df_merged = pd.merge(nyt_covid_data, jh_us_covid_data, on="date")
    return df_merged[['date', 'cases', 'deaths', 'recovered']]
  except (Exception) as error:
      raise error
