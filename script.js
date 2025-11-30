function waitForContinue(buttonId) {
  return new Promise(resolve => {
    document.getElementById(buttonId).addEventListener('click', resolve, { once: true });
  });
}



function getFormInput() {
    let mode = "";


    return new Promise((resolve) => {
        const form = document.getElementById("myForm");
        
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const startLocation = form.elements.namedItem("start").value;
            const endLocation = form.elements.namedItem("end").value;
            const Btoggle = document.getElementById('brainRot');
            const Htoggle = document.getElementById('homer');
               
            if (Htoggle.checked) {
                mode = "homer"
                console.log(mode);
            }

            if (Btoggle.checked) {
                mode = "brainRot"
                console.log(mode);
            }

            resolve({ startLocation, endLocation, mode });
        }, { once: true }); // ensures no duplicate listeners
    });
    
}

function getQuery(){
      return new Promise((resolve) => {
        const form = document.getElementById("queryForm");

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const query = form.elements.namedItem("query").value;

            resolve({ query });
        }, { once: true }); // ensures no duplicate listeners
    });

}

let storySoFar = "";

async function playStory() {
    showPopup();

    const { startLocation, endLocation, mode } = await getFormInput();
    console.log("Client sending:", startLocation, endLocation, mode);
    
    const res = await fetch("http://localhost:3000/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startLocation, endLocation, mode })
    });

    const data = await res.json();

    const audioEl = document.getElementById("aiAudio");
    const storyDiv = document.getElementById("aiResponse");
    storyDiv.innerHTML = "";
    

    for (const seg of data.segments) {
        const audioBlob = new Blob(
        [Uint8Array.from(atob(seg.audio), c => c.charCodeAt(0))],
        { type: "audio/wav" }
        );
        
        const url = URL.createObjectURL(audioBlob);
        // Show text and voice info
        const p = document.createElement("p");

        if (seg.speaker == "Narrator"){
          p.innerHTML = `${seg.text}`;
        }else{
          p.innerHTML = `<b>${seg.speaker}:</b> ${seg.text}`;
        }
        
        storyDiv.appendChild(p);
        storySoFar = storySoFar + `${seg.speaker}: ${seg.text}\n`

        
        document.getElementById("typewriter").hidden = true;
        document.getElementById("continue").hidden = false;
        await new Promise(resolve => {
        audioEl.src = url;        
        audioEl.play();
        audioEl.onended = resolve;
        })

        event.preventDefault(); // Prevent the form from reloading the page

    }
    



   


    const response = await fetch("http://localhost:3000/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            startLocation,
            endLocation,
            mode
        })

        
    });

  
    console.log(data);
    
        

    //waits for the continue button to be pressed to get the next string read
    await waitForContinue("continue");
    
  
}

async function askQuery() {

    const { query } = await getQuery();
    console.log("Client sending:", query);
    
    const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storySoFar, query })
    });

    const data = await res.json();
    console.log(data);

    const responseDiv = document.getElementById("queryResponse");
    responseDiv.innerHTML = ""
    const p = document.createElement("p");
    p.innerHTML = data.answer;
    responseDiv.appendChild(p);

}


function showPopup() {
    document.getElementById("typewriter").hidden = false;
    document.getElementById("default-modal").classList.remove("hidden");
}

function hidePopup() {
    
    storyPopupHidden = true;

    document.getElementById("continue").hidden = true;
    const audio = document.getElementById("aiAudio");
2
    // Stop audio immediately
    audio.pause();
    audio.src = "";         // <<< THIS STOPS THE pending onended event
    audio.onended = null;   // <<< prevent the Promise from resolving


    document.getElementById("default-modal").classList.add('hidden');
    document.getElementById("aiResponse").innerHTML = "";
    console.log(document.getElementById("aiResponse"));
}

const homer = document.getElementById("homer");
const brainRot = document.getElementById("brainRot");


    

