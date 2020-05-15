
window.onload = function () {
    const commentHolder = document.getElementById("comment-holder");
  

  
    commentHolder.addEventListener("keypress", function (e) {
      if (commentHolder.hasChildNodes(e.target)) {
        if (e.key === "Enter") {
          let commentId = e.target.dataset.comment;
          let value = e.target.value;
  
          if (value) {
            let data = {
              body: value,
            };
            // let req = generateRequest(`/user/replies/${commentId}`, 'POST', data)
            fetch(`/user/replies/${commentId}`, {
              method: "POST",
              mode: "cors",
              body: JSON.stringify(data),
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
              },
            })
              .then(res => res.json())
              .then((data) => {
                console.log(data);
  
  
                let replyElement = createReplyElement(data);
                let parent = e.target.parentElement;
                parent.previousElementSibling.appendChild(replyElement);
                e.target.value = "";
              })
              .catch((e) => {
                console.log(e);
                alert(e.message);
              });
          } else {
            alert("Please Enter A Valid Reply");
          }
        }
      }
    });
  
  
   
    
  
   
  };
  

  function createReplyElement(reply) {
    let innerHTML = `
        <img style="width:40px;"
            src="${reply.profileImage}" 
            class="align-self-start mr-3 rounded-circle">
        <div class="media-body">
        <h6 class="mt-0"> ${reply.username}</h6>
            <p>${reply.body}</p>
  
        </div>
    `;
  
    let div = document.createElement("div");
    div.className = "media mt-3";
    div.innerHTML = innerHTML;
  
    return div;
  }
  