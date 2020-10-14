import unittest
import pandas as pd
import numpy
from us_covid_transform import transform, filter_us_only
import os
import sys

class TestUsCovidtransformation(unittest.TestCase):
    def setUp(self):
        self._test_covid_nyt_data = pd.read_csv(os.path.join(sys.path[0], 'testdata/unclean_nyt_data.csv'))
        self._test_covid_jh_data = pd.read_csv(os.path.join(sys.path[0], 'testdata/unclean_jh_data.csv'))

    # check only us data is there
    def test_filter_us_only(self):
        result = filter_us_only(self._test_covid_jh_data)
        self.assertEqual(result['country/region'].shape, (1,))


    def test_transform(self):
        df_transformed = transform(self._test_covid_nyt_data, self._test_covid_jh_data)
        expected_shape = (10, 4)
        self.assertTupleEqual(df_transformed.shape, expected_shape)
        # check if the correct fields are avaliable
        exp_columns = list(['date', 'cases', 'deaths', 'recovered'])
        self.assertListEqual(list(df_transformed.columns), exp_columns)
        # check if dates are date and not string and formated correct (https://www.kaggle.com/rtatman/data-cleaning-challenge-parsing-dates#Check-the-data-type-of-our-date-column)
        self.assertEqual(df_transformed['date'].dtype, 'datetime64[ns]')

    def test_sum(self):
        self.assertEqual(sum([1, 2, 3]), 6, "Should be 6")
        

if __name__ == '__main__':
    unittest.main()
