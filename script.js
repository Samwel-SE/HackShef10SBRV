function waitForContinue(buttonId) {
  return new Promise(resolve => {
    document.getElementById(buttonId).addEventListener('click', resolve, { once: true });
  });
}

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

async function playStory() {
    showPopup();

    const { startLocation, endLocation } = await getFormInput();
    console.log("Client sending:", startLocation, endLocation);
    
    const res = await fetch("http://localhost:3000/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startLocation, endLocation })
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
        p.innerHTML = `<b>${seg.speaker} (${seg.voice}):</b> ${seg.text}`;
        storyDiv.appendChild(p);
        
        document.getElementById("typewriter").hidden = true;
        document.getElementById("continue").hidden = false;
        await new Promise(resolve => {
        audioEl.src = url;        
        audioEl.play();
        audioEl.onended = resolve;
        }
    );
        

    //waits for the continue button to be pressed to get the next string read
    await waitForContinue("continue");
    
  }
}

function showPopup() {
    document.getElementById("typewriter").hidden = false;
    document.getElementById("default-modal").classList.remove("hidden");
}

function hidePopup() {
    
    storyPopupHidden = true;

    document.getElementById("continue").hidden = true;
    const audio = document.getElementById("aiAudio");

    // Stop audio immediately
    audio.pause();
    audio.src = "";         // <<< THIS STOPS THE pending onended event
    audio.onended = null;   // <<< prevent the Promise from resolving


    document.getElementById("default-modal").classList.add('hidden');
    document.getElementById("aiResponse").innerHTML = "";
    console.log(document.getElementById("aiResponse"));
}
