from dotenv import load_dotenv
import os
from openai import OpenAI

from flask import Flask, redirect, url_for, request, render_template


#gets the chatGPT API Key
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


app = Flask(__name__)

message = ""

@app.route('/')
def home(methods =['POST', 'GET']):
    
    
    if request.method == 'POST':
        time = request.form['timeInput']
        city = request.form['cityInput']
        message = time + " and city are connected " + city
    else:
        pass
    
    return render_template('index.html', message=message)








