from dotenv import load_dotenv
import os
from openai import OpenAI
from agents import Agent, Runner

load_dotenv()
<<<<<<< HEAD
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
=======
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
>>>>>>> 06e988c6970bfb284c759467d9ec330115f7f13d
