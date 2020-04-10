window.onload = function (){
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
   
    
}