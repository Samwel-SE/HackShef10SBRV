

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



