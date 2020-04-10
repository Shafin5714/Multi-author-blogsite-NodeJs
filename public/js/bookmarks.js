window.onload = function (){
    const bookmark = document.getElementsByClassName('bookmark');
    // convert into array
    [...bookmark].forEach(bookmark =>{
        bookmark.style.cursor = 'pointer'
        bookmark.addEventListener('click',function(e){
            // clicking on icon but we want the value of parent span
            let target = e.target.parentElement
            console.log(target);
            
            let headers = new Headers()
            headers.append('Accept','Application/JSON')
            let req = new Request(`/user/bookmark/${target.dataset.post}`,{
                method: 'GET',
                headers,
                mode:'cors'
            })
                      
            fetch(req).then(res=>res.json()).then(data=>{
                // console.log(data);
                
                if(data.bookmark){
                    console.log(data.bookmark); 
                    target.innerHTML = '<i class="fas fa-bookmark"></i>'

                    
                }else{
                    console.log(data.bookmark); 
                    target.innerHTML = '<i class="far fa-bookmark"></i>'
                   
                }
            })
            .catch(e=>{
                console.error(e.response.data)
                alert(e.response.data.error)
            })
        })
    })
}