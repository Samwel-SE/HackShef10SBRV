

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
    const { startLocation, endLocation } = await getFormInput();
    console.log("Client sending:", startLocation, endLocation);

    try {
        const res = await fetch("http://localhost:3000/story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startLocation, endLocation })
        });

        const data = await res.json();
        console.log("Story text received:", data.text);
        console.log("Audio base64 length:", data.audio.length);

        // Show story
        document.getElementById("aiResponse").textContent = data.text;

        // Play audio
        const audioEl = document.getElementById("aiAudio");
        const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
            { type: "audio/wav" }
        );

        // Revoke previous object URL to avoid memory leaks
        if (audioEl.src) URL.revokeObjectURL(audioEl.src);
        audioEl.src = URL.createObjectURL(audioBlob);

        audioEl.load(); // Make sure browser loads the new blob
        audioEl.play().then(() => console.log("Audio playing!"))
                     .catch(err => console.error("Audio play error:", err));

    } catch (err) {
        console.error("Error fetching story:", err);
    }
}


async function playStory() {
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

    await new Promise(resolve => {
      audioEl.src = url;
      audioEl.play();
      audioEl.onended = resolve;
    });
  }
}



