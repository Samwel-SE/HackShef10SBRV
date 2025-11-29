

function getFormInput() {
    return new Promise((resolve) => {
        const form = document.getElementById("myForm");

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const startLocation = form.elements.namedItem("start").value;
            const endLocation = form.elements.namedItem("end").value;

            resolve({ startLocation, endLocation });
        }, { once: true }); // ensures no duplicate listeners
    });
}

async function getsAIResponse() {
    await getFormInput().then(async ({startLocation, endLocation}) => {

        //tests to see if function has params 
        console.log(startLocation);
        console.log(endLocation);
        
        const res = await fetch("http://localhost:3000/story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startLocation, endLocation})
        });

        const data = await res.json();
        console.log(data.textContent)
        document.getElementById("aiResponse").textContent = data.text
    })  

    

}
