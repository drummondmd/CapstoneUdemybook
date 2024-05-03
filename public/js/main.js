$("#new-btn" ).on( "click", function() {
    $("#search").toggle()
    $("#edit-btn").toggle()
    $("#new-btn").toggle()
    $("#user-btn").toggle()
    
    
} );
$("#edit-btn" ).on( "click", function() {
    $("#edit").toggle()
    $("#new-btn").toggle()
    $("#edit-btn").toggle()
    $("#user-btn").toggle()
    
} );

$("#user-btn" ).on( "click", function() {
    $("#user").toggle()
    $("#new-btn").toggle()
    $("#edit-btn").toggle()
    $("#user-btn").toggle()
    
} );

/// buscar livro pelo nome, autor ou isbn

async function fetchData(searchTerm) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchTerm}&limit=10`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data);
        const result = data.docs;
        const bookTitle = result.map((book) => book.title);
        const bookAuthor = result.map((book) => book.author_name ? book.author_name[0] : 'Unknown');
        const coverId = result.map((book) => book.cover_i);
        
        return {
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            coverId: coverId,
        };
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

// update dropdow



$("#search-input").on( "click",async function() {
    console.log("clicado")
    let val  = $('#searchInput').val()
    const { bookTitle, bookAuthor, coverId,isbn } = await fetchData(val);            
    const html = bookTitle.map((elem,index)=>
    `  
    <div class="col-4">
    <li class="listItem" id="book-search-${index}" style="cursor: pointer" >
    <div class="row">
        <div class="col-4">
            <img src="https://covers.openlibrary.org/b/id/${coverId[index]}-S.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png" width="80" height="120" alt="book picture">
        </div>
        <div class="col-8">
            <p>${elem}</p>
            <p>Autor: ${bookAuthor[index]} </p>
        </div>
    </div>
    </li>
    </div>
    `
);

$(".dropdownList").html(html)
console.log(html)
return html
});

//preencher form com escholha

$(".dropdownList").on("click","li",async function(){
    let val  = $('#searchInput').val()
    const { bookTitle, bookAuthor, coverId,isbn } = await fetchData(val);
    const id = this.id
    const index =parseInt(id.slice(12))
    
    $("#newSubmit").toggle()
    $("#search").hide()
    $('input[name=titulo]').val(bookTitle[index]);
    $('input[name=autor]').val(bookAuthor[index]);
    $('input[name=titulo]').val(bookTitle[index]);
    $('input[name=cover_id]').val(coverId[index]);
})



/// prevent enter to submit the form
$(document).keypress(
    function(event){
        if (event.which == '13') {
            event.preventDefault();
        }
    })