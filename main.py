from dotenv import load_dotenv
import os
from openai import OpenAI
from agents import Agent, Runner

from flask import Flask, redirect, url_for, request, render_template


#gets the chatGPT API Key
load_dotenv()


key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = key


client = OpenAI(api_key=key)


agent = Agent(name="Assistant", instructions="You are a helpful assistant")
result = Runner.run_sync(agent, "Write a haiku about a recursion in programming")

#response = client.responses.create(
#    model="gpt-5",
#    input="Write a one-sentence bedtime story about a unicorn."
#)

print(result.final_output)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)


@app.route('/login', methods=['POST', 'GET'])
def home():
    
    if request.method == 'POST':
        time = request.form['timeInput']
        city = request.form['startCityInput']
        message = time + " and city are connected " + city
        print(message)
    else:
        pass
    
    return render_template('index.html', message=message)

if __name__ == '__main__':
    app.run(debug=True)