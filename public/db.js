let db; 

const request = indexedDB.open("budget", 1); 

request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createOjbectStore("pending", {autoIncrement: true})
}; 

request.onsuccess = function(event)  {
    db = event.target.result; 
    if (navigator.online){
        accessDatabase(); 
    }
}; 

request.onerror = function(event) {
    console.log("Oh no! " + event.target.errorCode)
}; 

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readWrite"); 
    const store = transaction.objectStore("pending"); 
    store.add(record); 
}; 

function accessDatabase() {
    const transaction = db.transaction(["pending"], "readWrite"); 
    const store = transaction.objectStore("pending"); 
    const getAll = store.getAll(); 
    
    getAll.onsuccess = function(){
        if (getAll.result.length > 0){
            fetch("/api/transcation/bulk", {
                method: "POST", 
                body: JSON.stringify(getAll.result), 
                headers: {
                    Accept: "application/json, text/plain, */*", 
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readWrite")
                const store = transaction.objectStore("pending"); 

                store.clear(); 
            })
        }
    }; 
}

window.addEventListener("online", accessDatabase); 