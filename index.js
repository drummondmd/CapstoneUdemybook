import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import ejs from "ejs";
import axios from "axios";

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database:"permalist",
    password:"123369",
    port: 5432
});
db.connect();

// função para buscar dados
let avaliacoes = {};


async function getUser(){
    const user = await db.query ('SELECT * from usuarios')
    return user.rows
}

async function getBookings(){
    const bookings = await db.query ('SELECT * from livros')
    return bookings.rows
}

async function getAvaliacoes (){
    const result =  await db.query('SELECT avaliacoes.*, usuarios.nome,livros.titulo,livros.autor,livros.cover_id from avaliacoes INNER JOIN usuarios ON user_id = usuarios.id INNER JOIN livros ON book_id = livros.id')
    avaliacoes  = result.rows
    return avaliacoes

}

const default_cover = "https://openlibrary.org/static/images/icons/avatar_book-sm.png"

app.get("/",async(req,res)=>{
    let order = req.query.order ? req.query.order : "avaliacoes.nota" 
    try {
        const result = await db.query('SELECT avaliacoes.*, usuarios.nome,livros.titulo,livros.autor,livros.cover_id from avaliacoes INNER JOIN usuarios ON user_id = usuarios.id INNER JOIN livros ON book_id = livros.id ORDER BY '+ order + ' DESC')
        res.render("index.ejs",{result:result.rows})
        
    } catch (error) {
        console.log(error);
        ///melhorar erro depois
        res.send("Erro")
        
    }
})

app.get("/editor",async (req,res)=>{
    //console.log(avaliacoes)
    const user = await getUser()
    const bookings = await getBookings()
    const result = await db.query('SELECT avaliacoes.*, usuarios.nome,livros.titulo,livros.autor,livros.cover_id from avaliacoes INNER JOIN usuarios ON user_id = usuarios.id INNER JOIN livros ON book_id = livros.id ')
    //console.log(result.rows)

    res.render("editor.ejs",{user:user,bookings:bookings,avaliacoes:result.rows})
})

app.post("/user",async (req,res)=>{
    try {
        //console.log(req.body)
        await db.query("INSERT INTO usuarios (nome) VALUES ($1)",[req.body.usuario])
        res.render("editor.ejs")
        
    } catch (error) {
        console.log(error)
        res.send("Algo deu errado")
    }
    
});

app.post("/submit",async (req,res)=>{
    try {
        const hoje = new Date()
        const user_id =parseInt(req.body.usuario)
        const cover_id  = req.body.cover_id
        
        try {
            let result = await db.query ('SELECT id from livros WHERE titulo = $1',[req.body.titulo])
            let exist_id = result.rows[0]

            if(result.rowCount === 0){   
                console.log("Livro não existente, será adicionado")
                //adicionar novo livro
                const result = await db.query("INSERT INTO livros (titulo,cover_id,autor) VALUES ($1,$2,$3) RETURNING id",[req.body.titulo,cover_id,req.body.autor]);
                const new_id = result.rows[0];
                console.log(new_id)
                await db.query("INSERT INTO avaliacoes (user_id,book_id,nota,data_avaliacao,avaliacao) VALUES ($1,$2,$3,$4,$5)",[user_id,new_id.id,req.body.nota,hoje,req.body.corpo]);
                res.redirect("/")
             
            }else{
                console.log("Livro existente, será adicionado avaliação")
                await db.query( "INSERT INTO avaliacoes (user_id,book_id,nota,data_avaliacao,avaliacao) VALUES ($1,$2,$3,$4,$5)",[user_id,exist_id.id,req.body.nota,hoje,req.body.corpo] )
                console.log("Avaliação adicionada,redicionar para pagina inicial")
                res.redirect("/")
             }
        } catch (error) {
            console.log(error)
            res.send("Algo deu errado ao procurar o livro")
            
        }
      
    } catch (error) {
        console.log(error)
        res.send("Algo deu errado")
    }
    
});


app.post("/delete-av", async(req,res)=>{
    const id = req.body.deleteItemId
    try {
        //console.log(id)
        await db.query( "DELETE FROM avaliacoes WHERE id = $1",[id])
        res.redirect("/editor")
    } catch (error) {
        console.log("Erro na exclusão do arquivo")
        res.send("Algum erro aconteceu")

    }
})


app.get("/edit/:id", async (req,res)=> {
    const id = parseInt(req.params.id)
    try {

        await getAvaliacoes();
        const avChoose = avaliacoes.filter((elem)=> elem.id === id)
        res.render("edit.ejs",{result:avChoose[0]})
      
    } catch (error) {
        console.log("Erro na obtenção da avaliação")
        res.send("algo de errado aconteceu")
        
    }

})

app.post("/edit", async (req,res)=>{
    const hoje = new Date()
    const id = parseInt(req.body.id);
    try {
        await db.query("UPDATE avaliacoes SET nota= $1,data_avaliacao=$2,avaliacao=$3 WHERE id=$4",[req.body.nota,hoje,req.body.corpo,id])
        res.redirect("/")
        
    } catch (error) {
        console.log("Erro na obtençao das avaliações")
        res.send("Algum erro aconteceu")

        
    }

})








app.listen(port,(req)=>{
    console.log(`Servidor funcionando em ${port}`);
});