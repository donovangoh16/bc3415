import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://www.uob.com.sg/personal/customer-service/tmrw-user-guide/index.page"

def scrape_uob_payments():
    resp = requests.get(BASE_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    section = soup.select_one('div[id="payments/-transfer-services"].faq-section')
    if not section:
        print("❌ Could not find payments section")
        return

    data = []
    category = section.find("h2").get_text(strip=True)

    # All accordion buttons
    buttons = section.select("button.accordion-button.dtm-accordion")
    for btn in buttons:
        question = btn.get_text(strip=True)
        content = btn.find_next_sibling("div", class_="accordion-content")
        if not content:
            continue

        # Extract steps and text
        steps = []
        for p in content.select("p"):
            text = " ".join(p.stripped_strings)
            if text:
                steps.append(text)

        data.append({
            "category": category,
            "question": question,
            "answer": steps,
            "source_url": BASE_URL
        })

    # Save results
    with open("uob_payments_transfer_services.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Extracted {len(data)} FAQs from {category}")

if __name__ == "__main__":
    scrape_uob_payments()
