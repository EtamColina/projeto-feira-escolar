
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbxxcUflx_gxEniGdiVFB_N3apQjy7YeCYXGvBKlMdvaf1ewNhAOzk4eTjHxSMC3fhHTyw/exec";

let carrinho = [];
let pedidoEmProcessamento = false;

// Catálogo de produtos
const PRODUTOS = {
    "Sonho de Creme": 10,
    "Sonho de Doce de Leite": 10,
    "Escalda Pés": 5
};

function formatarValor(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
}

function calcularTotal() {
    return carrinho.reduce(function (soma, produto) {
        return soma + produto.preco;
    }, 0);
}

function adicionarProduto(nome, preco) {
    if (pedidoEmProcessamento) return;

    if (!Object.prototype.hasOwnProperty.call(PRODUTOS, nome)) {
        alert("Produto não reconhecido.");
        return;
    }

    carrinho.push({
        nome: nome,
        preco: PRODUTOS[nome]
    });

    atualizarCarrinho();
}

function removerProduto(indice) {
    if (pedidoEmProcessamento) return;
    if (indice < 0 || indice >= carrinho.length) return;

    carrinho.splice(indice, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const quantidade = document.getElementById("quantidade-carrinho");
    const totalElemento = document.getElementById("total");

    if (!lista || !quantidade || !totalElemento) return;

    lista.replaceChildren();
    quantidade.textContent = carrinho.length;

    totalElemento.textContent = "R$ " + formatarValor(calcularTotal());

    if (carrinho.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "carrinho-vazio";
        vazio.textContent = "Seu pedido ainda está vazio.";
        lista.appendChild(vazio);
    } else {
        carrinho.forEach(function (produto, indice) {
            const linha = document.createElement("div");
            linha.className = "item-carrinho";

            const informacao = document.createElement("span");
            informacao.className = "item-carrinho-info";
            informacao.textContent =
                produto.nome + " — R$ " + formatarValor(produto.preco);

            const botaoRemover = document.createElement("button");
            botaoRemover.type = "button";
            botaoRemover.className = "botao-remover";
            botaoRemover.textContent = "Remover";
            botaoRemover.disabled = pedidoEmProcessamento;

            botaoRemover.addEventListener("click", function () {
                removerProduto(indice);
            });

            linha.appendChild(informacao);
            linha.appendChild(botaoRemover);
            lista.appendChild(linha);
        });
    }

    document.querySelectorAll(".produto button").forEach(function (botao) {
        botao.disabled = pedidoEmProcessamento;
    });

    atualizarResumoPedido();
}

function atualizarResumoPedido() {
    const resumo = document.getElementById("resumo-pedido");
    const totalFormulario = document.getElementById("total-formulario");

    if (!resumo || !totalFormulario) return;

    resumo.replaceChildren();

    const agrupamento = {};

    carrinho.forEach(function (produto) {
        if (!agrupamento[produto.nome]) {
            agrupamento[produto.nome] = {
                quantidade: 0,
                preco: produto.preco
            };
        }

        agrupamento[produto.nome].quantidade++;
    });

    Object.keys(agrupamento).forEach(function (nome) {
        const item = agrupamento[nome];

        const linha = document.createElement("div");
        linha.className = "linha-resumo";

        const descricao = document.createElement("span");
        descricao.textContent = item.quantidade + " x " + nome;

        const subtotal = document.createElement("strong");
        subtotal.textContent =
            "R$ " + formatarValor(item.quantidade * item.preco);

        linha.appendChild(descricao);
        linha.appendChild(subtotal);
        resumo.appendChild(linha);
    });

    totalFormulario.textContent =
        "R$ " + formatarValor(calcularTotal());
}

function irParaProdutos() {
    document.getElementById("produtos").scrollIntoView({
        behavior: "smooth"
    });
}

function finalizarPedido() {
    if (pedidoEmProcessamento) return;

    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto antes de continuar.");
        return;
    }

    atualizarResumoPedido();

    const formularioPedido = document.getElementById("formulario-pedido");
    formularioPedido.hidden = false;

    formularioPedido.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function novoPedido() {
    carrinho = [];
    pedidoEmProcessamento = false;

    const formulario = document.getElementById("formulario");
    const formularioPedido = document.getElementById("formulario-pedido");
    const confirmar = document.getElementById("confirmar-pedido");
    const botaoNovo = document.getElementById("novo-pedido");
    const mensagem = document.getElementById("mensagem-pedido");

    formulario.reset();

    confirmar.disabled = false;
    confirmar.hidden = false;
    confirmar.textContent = "Continuar para pagamento";

    botaoNovo.hidden = true;
    mensagem.textContent = "";

    atualizarCarrinho();
    formularioPedido.hidden = true;

    document.getElementById("produtos").scrollIntoView({
        behavior: "smooth"
    });
}

// Gera identificador exclusivo para a tentativa de pedido
function gerarIdentificadorPedido() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return "jepp-" + Date.now() + "-" +
        Math.random().toString(36).substring(2, 12);
}

// Envia o pedido ao Google Apps Script por formulário.
// A resposta do servidor abre a página com o acesso ao checkout.
function enviarParaCheckout(dadosPedido) {
    const formularioEnvio = document.createElement("form");

    formularioEnvio.method = "POST";
    formularioEnvio.action = URL_PLANILHA;
    formularioEnvio.target = "_self";
    formularioEnvio.style.display = "none";

    const campoPayload = document.createElement("input");

    campoPayload.type = "hidden";
    campoPayload.name = "payload";
    campoPayload.value = JSON.stringify(dadosPedido);

    formularioEnvio.appendChild(campoPayload);
    document.body.appendChild(formularioEnvio);

    formularioEnvio.submit();
}

document.addEventListener("DOMContentLoaded", function () {
    atualizarCarrinho();

    const formulario = document.getElementById("formulario");

    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (pedidoEmProcessamento) return;

        if (carrinho.length === 0) {
            document.getElementById("mensagem-pedido").textContent =
                "Adicione pelo menos um produto antes de continuar.";
            return;
        }

        if (!formulario.reportValidity()) return;

        const nome = document.getElementById("nome").value.trim();
        const whatsapp = document.getElementById("whatsapp").value.trim();

        if (!nome || !whatsapp) {
            document.getElementById("mensagem-pedido").textContent =
                "Preencha seu nome e WhatsApp.";
            return;
        }

        // Quantidades dos três produtos
        const quantidades = {
            sonhoCreme: 0,
            sonhoDoceLeite: 0,
            escaldaPes: 0
        };

        carrinho.forEach(function (produto) {
            if (produto.nome === "Sonho de Creme") {
                quantidades.sonhoCreme++;
            }

            if (produto.nome === "Sonho de Doce de Leite") {
                quantidades.sonhoDoceLeite++;
            }

            if (produto.nome === "Escalda Pés") {
                quantidades.escaldaPes++;
            }
        });

        const dadosPedido = {
            nome: nome,
            whatsapp: whatsapp,
            sonhoCreme: quantidades.sonhoCreme,
            sonhoDoceLeite: quantidades.sonhoDoceLeite,
            escaldaPes: quantidades.escaldaPes,
            request_id: gerarIdentificadorPedido()
        };

        const confirmar = document.getElementById("confirmar-pedido");
        const mensagem = document.getElementById("mensagem-pedido");

        pedidoEmProcessamento = true;

        confirmar.disabled = true;
        confirmar.textContent = "Encaminhando para pagamento...";

        atualizarCarrinho();

        mensagem.textContent =
            "Registrando seu pedido. Aguarde o encaminhamento para a InfinitePay.";

        enviarParaCheckout(dadosPedido);
    });
});
