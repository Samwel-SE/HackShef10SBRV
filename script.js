import axios from 'axios';

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

        // console.log(startCityInput);
        // console.log(timeInput);


        // const res = await fetch("/data", {
        //     method: "POST",
        //     body: JSON.stringify({ startCityInput, timeInput })
        // });

        return await axios.post("/data", {
            body: JSON.stringify({ startCityInput, timeInput })
        });

        // const data = await res.json();
        // console.log(data.text);

    })

}
