let carrinho = [];


// ADICIONAR PRODUTO

function adicionarProduto(nome, preco) {

    carrinho.push({
        nome: nome,
        preco: preco
    });

    atualizarCarrinho();

}


// ATUALIZAR CARRINHO

function atualizarCarrinho() {

    const lista = document.getElementById("lista-carrinho");

    const quantidade =
        document.getElementById("quantidade-carrinho");

    const total =
        document.getElementById("total");


    quantidade.textContent = carrinho.length;


    if (carrinho.length === 0) {

        lista.innerHTML =
            "<p>Seu pedido está vazio.</p>";

        total.textContent = "0,00";

        return;
    }


    lista.innerHTML = "";


    let valorTotal = 0;


    carrinho.forEach(function (produto, indice) {

        valorTotal += produto.preco;


        const item = document.createElement("div");

        item.innerHTML = `
            <p>
                <strong>${produto.nome}</strong>
                - R$ ${produto.preco.toFixed(2).replace(".", ",")}

                <button onclick="removerProduto(${indice})">
                    Remover
                </button>
            </p>
        `;


        lista.appendChild(item);

    });


    total.textContent =
        valorTotal.toFixed(2).replace(".", ",");

}


// REMOVER PRODUTO

function removerProduto(indice) {

    carrinho.splice(indice, 1);

    atualizarCarrinho();

}


// IR PARA PRODUTOS

function irParaProdutos() {

    document
        .getElementById("produtos")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// FINALIZAR

function finalizarPedido() {

    if (carrinho.length === 0) {

        alert("Adicione pelo menos um produto ao pedido.");

        return;
    }


    alert(
        "Seu pedido foi preparado!\\n\\n" +
        "Na próxima etapa vamos criar o formulário de pré-venda."
    );

}