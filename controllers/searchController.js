const Post = require('../models/Post')

exports.getSearchResult = async(req,res)=> {
    let term = req.query.term 
    let currentPage = parseInt(req.query.page) || 1
    let itemPerPage = 10

    try{
        let posts = await Post.find(
            {$text:{$search:term}}  /// it will search text based on term
        ).skip((itemPerPage * currentPage) - itemPerPage).limit(itemPerPage)
    let totalPost = await Post.countDocuments({
        $text:{$search: term}   
    })
    let totalPage = totalPost / itemPerPage 

    res.render('pages/search',{title:`Result for ${term}`,searchTerm:term,itemPerPage,currentPage,totalPage,posts,user:req.user})

    }catch(e){
        console.log(e);
        
    }
}