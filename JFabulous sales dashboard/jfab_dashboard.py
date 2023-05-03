

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

import streamlit as st
import os
from PIL import Image

#prepare data
# read in all invoices (interim solution)

angelica = pd.read_excel(r"C:/Users/criss/iCloudDrive/Desktop/JFABULOUS 2022/Rutas/Angelica Mota Shops/Angelica Mota Shops Combined.xlsx", sheet_name = "Invoices")
bb = pd.read_excel(r"C:/Users/criss/iCloudDrive/Desktop/JFABULOUS 2022/Rutas\B&B Spa\B&B Spa Combined.xlsx", sheet_name = "Invoices")
high = pd.read_excel(r"C:/Users/criss/iCloudDrive/Desktop/JFABULOUS 2022/Rutas\Hair High Tech\Hair High Tech Combined.xlsx", sheet_name = "Invoices")
ladore = pd.read_excel(r"C:/Users/criss/iCloudDrive/Desktop/JFABULOUS 2022/Rutas\Ladore Beauty Bar\Ladore Beauty Salon Combined.xlsx", sheet_name = "Invoices")
lis = pd.read_excel(r"C:/Users/criss/iCloudDrive/Desktop/JFABULOUS 2022/Rutas\Lissys Salon Spa\Lissys Salon Combined.xlsx", sheet_name = "Invoices")

#combine all dfs 
sales = pd.concat([angelica, bb, high, ladore, lis]).drop(columns = ["Qty", "Total $", "Unnamed: 17", "Qty left"])

sales["month_year"] = sales["Delivery Date"].apply(lambda x: x.strftime("%b %y"))


# dashboard 
st.title("JFABULOUS SALES")


"""
# JFabulous
"""
logo = Image.open("JFAB logo.jpg")
st.image(logo)


# overall sales


location = st.sidebar.selectbox("Choose sales location", 
                                    ("Angelica Mota Shops",
                                    "B&B Spa", 
                                    "Hair High Tech", 
                                    "Ladore Beauty Salon", 
                                    "Lissys Salon Spa") 

)



fig, ax = plt.subplots(figsize =(16, 8))
plt.bar(sales["month_year"], sales["Revenue $"])
ax.set_ylabel("Revenue $")
plt.show()
st.pyplot(fig)