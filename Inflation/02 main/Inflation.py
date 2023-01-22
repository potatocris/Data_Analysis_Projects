import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import streamlit as st
import seaborn as sns





st.set_page_config(page_title = 'Inflation Analysis', layout="wide")
#st.title('S&P500')


#side bar
with st.sidebar:
    explore = st.radio('Explore',
    ("UK", "US"))