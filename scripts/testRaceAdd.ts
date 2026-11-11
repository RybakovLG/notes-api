function createNotes() {
    return Promise.all(new Array(50)
        .fill(null)
        .map((_, i) => request({ method: 'post', body: JSON.stringify({ text: String(i) }) })))
}

createNotes().then((arrRes) => {
    console.log(arrRes.filter(res => res.ok).length + ' notes added')

    request().then(res => res.json()).then(notes => console.log(notes.length + ' notes in db'))
})

function request(options?: RequestInit) {
    return fetch('http://localhost:3000/notes', {
        headers: {
            "Content-Type": "application/json"
        }, ...options
    })
}