$(document).ready(function(){
    console.log("jQuery ir ready");
    
    $(".deleteUser").on("click", function(e){

        fetch("/users/delete", {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: e.target.id
            })
          })
            .then(res => {
                console.log(res)
                if (res.ok) {
                    console.log(res)
                    return res.json()

                }
            })
            .then(data => {
              window.location.reload()
            })
    })

    $(".deleteComputer").on("click", function(e){

        fetch("/computers/delete", {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: e.target.id
            })
          })
            .then(res => {
                console.log(res)
                if (res.ok) {
                    console.log(res)
                    return res.json()

                }
            })
            .then(data => {
              window.location.reload()
            })
    })
})