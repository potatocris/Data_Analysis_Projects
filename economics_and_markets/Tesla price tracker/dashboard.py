import datetime

import streamlit as st
import pandas as pd
import numpy as np
import tweepy
import yfinance as yf
from plotly import graph_objs as go
from datetime import date
from dateutil.relativedelta import relativedelta


"""
# Dashboard
"""
no_years = (1, 2 ,3 ,4 ,5 ,6 ,7, 8 ,9, 10)
select_start_year = st.selectbox("No. of years back", no_years)

#select box for stocks/assets
stocks = ("TSLA", "GME", "BTC-USD", "PLRT", )
selected_stocks = st.selectbox("Asset", stocks)

#time frame
today = date.today().strftime("%Y-%m-%d")
start = date.today() + relativedelta(years=-select_start_year)

#get data for yfinance
@st.cache # saves the data so it does not have load the data every time
def load_data(ticker):
    data = yf.download(ticker, start, today)
    data.reset_index(inplace=True) # will put the date in the first column
    return data

#data_load_state = st.text("Load data...")
data = load_data(selected_stocks)
#data_load_state.text("loading data done!")

#WRITING THE DATA
#st.subheader('Raw data')
#st.write(data.head())

def plot_price():
    st.subheader("Closing price")
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=data['Date'], y=data['Close'], name = 'Stock close'))
    fig.layout.update(xaxis_rangeslider_visible=True)
    st.plotly_chart(fig)

    vol = go.Figure()
    vol.add_trace(go.Bar(x=data['Date'], y=data['Volume'], name = 'Stock close'))
    st.subheader("Volume")
    vol.layout.update(xaxis_rangeslider_visible=True)
    st.plotly_chart(vol)
plot_price()


#NEWS SOURCES

#side bar options
option = st.sidebar.selectbox("Choose news source", ('Twitter', 'WallStreetBets', 'pattern', 'stocktwits'))
st.header(option)


#TWITTER
#twitter API
import yaml
with open("api_key.yaml") as file:
    twitter = yaml.safe_load(file)

consumer_key = twitter["consumer_key"]
consumer_secret = twitter["consumer_secret"]
bearer_token = twitter["bearer_token"]
access_token = twitter["access_token"]
access_token_secret = twitter["access_token_secret"]

auth = tweepy.OAuth1UserHandler(
        consumer_key, consumer_secret, access_token, access_token_secret
    )
api = tweepy.API(auth)


tesla_tweeters = [
    "elonmusk",
    "Tesla",
     "TeslaPodcast",
#     "heydave7",
#     # "p_ferragu",
#     # "TashaARK",
#     # "garyblack00",
#     # "TroyTeslike",
#     # "LimitThe",
#     # "SawyerMerritt",
#     # "Greentheonly",
#     # "kaparthy",
#     # "munster_gene",
#     # "teslacn",
#     # "squawksquare",
#     # "DivesTech",
#     # "cleantechnica",
#     # "teslaownersSV",
#     # "GerberKawasaki",
#     # "skorusARK",
#     # "Tesmanian_com",
#     # "stevenmarkryan",
#     # "TheTeslaLife",
#     # "EmmetPeppers",
#     # "Gfilche",
#     # "TeslaMotorsClub"
 ]


if option == 'Twitter':
    for id in tesla_tweeters:
        user = api.get_user(screen_name = id)
        st.subheader(id)
        st.image(user.profile_image_url_https)
        print(user.followers_count)

        tweets = api.user_timeline(screen_name = id, count = 10, include_rts= False,  tweets_mode= 'extended')


        for tweet in tweets:
            #st.write(tweet.text)
            #print(tweet.created_at)
            #print(tweet.urls)
            #print(tweet.urls)
            keywords = ('Tesla', 'tsla', 'annual', 'Giga')
            if any(keyword in tweet.text for keyword in keywords):
                st.write(tweet.text)
