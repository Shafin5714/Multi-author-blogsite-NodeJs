
window.onload = function () {
  const comment = document.getElementById("comment");
  const commentHolder = document.getElementById("comment-holder");

  comment.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      if (e.target.value) {
        let postId = comment.dataset.post;
        let data = {
          body: e.target.value,
        };
        // let req = generateRequest(`/user/comments/${postId}`, "POST", data);

        // console.log(JSON.stringify(data));

        fetch(`/user/comments/${postId}`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(data),
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            let commentElement = createComment(data);
            commentHolder.insertBefore(
              commentElement,
              commentHolder.children[0]
            );
            e.target.value = "";
          })
          .catch((e) => {
            console.log(e.message);
            alert(e.message);
          });
      } else {
        alert("Please Enter A Valid Comment");
      }
    }
  });

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


  // Like dislike
  const likeBtn  =  document.getElementById('likeBtn')
  const dislikeBtn  =  document.getElementById('dislikeBtn')
   likeBtn.addEventListener('click',function(e){
       let postId = likeBtn.dataset.post
       // res.json convert it into json fetch api rule
       reqLikeDislike('likes',postId).then(res=>res.json()).then(data=>{
           let likeText = data.liked ? 'Liked' : 'Like'
           likeText = likeText + ` ( ${data.totalLikes} )`
           let disLikeText = ` Dislike ( ${data.totalDisLikes} ) `
           likeBtn.innerHTML = likeText
           dislikeBtn.innerHTML = disLikeText

       }).catch(e=>{
           console.log(e);
           alert(e.response.data.error)
           
       })
   })
   dislikeBtn.addEventListener('click',function(e){
       let postId = likeBtn.dataset.post
       // res.json convert it into json fetch api rule
       reqLikeDislike('dislikes',postId).then(res=>res.json()).then(data=>{
           let disLikeText = data.liked ? 'Disliked' : 'Dislike'
           disLikeText = disLikeText + ` ( ${data.totalDisLikes} )`
           let likeText = ` Like ( ${data.totalLikes} ) `
           likeBtn.innerHTML = likeText
           dislikeBtn.innerHTML = disLikeText

       }).catch(e=>{
           console.log(e);
           alert(e.response.data.error)
           
       })
   })

   function reqLikeDislike (type ,postId){
       let headers = new Headers()
       headers.append('Accept','Application/JSON')
       headers.append('Content-Type','Application/JSON')
       let req = new Request(`/user/${type}/${postId}`,{
           method:'GET',
           headers,
           mode:'cors'
       })

       return fetch(req)
   }
};

function generateRequest(url, method, body) {
  let headers = new Headers();
  headers.append("Accept", "Application/JSON");
  headers.append("Content-type", "Application/JSON");
  console.log(body);

  let req = new Request(url, {
    method,
    headers,
    body: JSON.stringify(body),
    mode: "cors",
  });

  return req;
}

function createComment(comment) {
  // var d = new Date("JANUARY, 25, 2015");
  // const moment = require('moment')
  var date = moment().format("MMM Do YY")
  let innerHTML = `
    <img
        src="${comment.user.profileImage}" 
        class="rounded-circle mx-3 my-3" style="width:40px;">
        <div class="media-body my-3">
        <h5 class="m-0">${comment.user.username} </h5>
        <h6 class="text-muted mb-2 date"> ${date} </h6>
        <p>${comment.body}</p>
        
        

        <div class="my-3">
            <input class="form-control" type="text" placeholder="Press Enter to Reply" name="reply" data-comment=${comment._id} />
        </div>
    </div>
    `;
  let div = document.createElement("div");
  div.className = "media border";
  div.innerHTML = innerHTML;

  return div;
}
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
