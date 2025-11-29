

function getFormInput() {
    return new Promise((resolve) => {
        const form = document.getElementById("myForm");

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const startCityInput = form.elements.namedItem("start").value;
            const timeInput = form.elements.namedItem("year").value;

            resolve({ startCityInput, timeInput });
        }, { once: true }); // ensures no duplicate listeners
    });
}

async function getsAIResponse() {
    await getFormInput().then(async ({startCityInput, timeInput}) => {

        console.log(startCityInput);
        console.log(timeInput);


        const res = await fetch("http://localhost:3000/story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startCityInput, timeInput })
        });

        const data = await res.json();
        console.log(data.text);

    })

}
