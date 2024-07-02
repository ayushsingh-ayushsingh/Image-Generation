from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time
import requests

def generate_ai_art(prompt):
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920x1080")
    chrome_options.add_argument("--incognito")

    driver = webdriver.Chrome(options=chrome_options)
    
    driver.get('https://replicate.com/stability-ai/stable-diffusion-3?prediction=jrdt4zf9anrm00cgeecvs7fhbr')
    
    try:
        input_area = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'prompt'))
        )
        
        input_area.clear()
        input_area.send_keys(prompt)
        
        ActionChains(driver)\
            .key_down(Keys.CONTROL)\
            .send_keys(Keys.ENTER)\
            .key_up(Keys.CONTROL)\
            .perform()
        
        image_element = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.XPATH, "//img[@data-testid='value-output-image']"))
        )
        
        image_url = image_element.get_attribute('src')
        
        response = requests.get(image_url)
        if response.status_code == 200:
            with open('image.webp', 'wb') as file:
                file.write(response.content)
            print("Image saved as 'image.webp'")
        else:
            print("Failed to download the image")
        
    finally:
        driver.quit()

text_prompt = input("Prompt : ")
generate_ai_art(text_prompt)
