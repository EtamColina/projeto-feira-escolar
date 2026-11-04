
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbxxcUflx_gxEniGdiVFB_N3apQjy7YeCYXGvBKlMdvaf1ewNhAOzk4eTjHxSMC3fhHTyw/exec";

let carrinho = [];
let pedidoEmProcessamento = false;
const CHAVE_PIX = "6b00a155-cbbe-4c31-aa39-bfb551694181";

function formatarValor(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
}

function adicionarProduto(nome, preco) {
    if (pedidoEmProcessamento) return;

    carrinho.push({
        nome: nome,
        preco: Number(preco)
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

    const total = carrinho.reduce(function (soma, produto) {
        return soma + produto.preco;
    }, 0);

    totalElemento.textContent = "R$ " + formatarValor(total);

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

    const total = carrinho.reduce(function (soma, produto) {
        return soma + produto.preco;
    }, 0);

    totalFormulario.textContent = "R$ " + formatarValor(total);
    atualizarPix();
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
    atualizarPix();
    formulario.dataset.enviando = "nao";

    confirmar.disabled = false;
    confirmar.hidden = false;
    botaoNovo.hidden = true;
    mensagem.textContent = "";

    atualizarCarrinho();
    formularioPedido.hidden = true;

    document.getElementById("produtos").scrollIntoView({
        behavior: "smooth"
    });
}

function atualizarPix() {
    const pagamento = document.getElementById("pagamento");
    const areaPix = document.getElementById("pix-area");
    const totalPix = document.getElementById("pix-total");

    if (!pagamento || !areaPix || !totalPix) return;

    const pixSelecionado = pagamento.value === "Pix antecipado";

    areaPix.hidden = !pixSelecionado;

    if (pixSelecionado) {
        const total = carrinho.reduce(function (soma, produto) {
            return soma + produto.preco;
        }, 0);

        totalPix.textContent = "R$ " + formatarValor(total);
    }
}

async function copiarChavePix() {
    try {
        await navigator.clipboard.writeText(CHAVE_PIX);

        document.getElementById("mensagem-pix").textContent =
            "Chave Pix copiada!";

    } catch (erro) {
        document.getElementById("mensagem-pix").textContent =
            "Não foi possível copiar automaticamente. Selecione e copie a chave acima.";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    atualizarCarrinho();

    const formulario = document.getElementById("formulario");
    if (!formulario) return;

const campoPagamento = document.getElementById("pagamento");
const botaoCopiarPix = document.getElementById("copiar-pix");

campoPagamento.addEventListener("change", atualizarPix);
botaoCopiarPix.addEventListener("click", copiarChavePix);

atualizarPix();

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        if (pedidoEmProcessamento) return;

        if (carrinho.length === 0) {
            document.getElementById("mensagem-pedido").textContent =
                "Adicione pelo menos um produto antes de enviar.";
            return;
        }

        if (!formulario.reportValidity()) return;

        const nome = document.getElementById("nome").value.trim();
        const whatsapp = document.getElementById("whatsapp").value.trim();
        const pagamento = document.getElementById("pagamento").value;

        if (!nome || !whatsapp || !pagamento) {
            document.getElementById("mensagem-pedido").textContent =
                "Preencha todos os campos antes de enviar.";
            return;
        }

        const quantidades = {
            chaveiros: 0,
            sonhos: 0,
            aromatizadores: 0
        };

        carrinho.forEach(function (produto) {
            if (produto.nome === "Chaveiro") {
                quantidades.chaveiros++;
            } else if (produto.nome === "Sonho") {
                quantidades.sonhos++;
            } else if (produto.nome === "Aromatizador") {
                quantidades.aromatizadores++;
            }
        });

        const dadosPedido = {
            nome: nome,
            whatsapp: whatsapp,
            pagamento: pagamento,
            chaveiros: quantidades.chaveiros,
            sonhos: quantidades.sonhos,
            aromatizadores: quantidades.aromatizadores
        };

        const confirmar = document.getElementById("confirmar-pedido");
        const mensagem = document.getElementById("mensagem-pedido");
        const botaoNovo = document.getElementById("novo-pedido");

        pedidoEmProcessamento = true;
        formulario.dataset.enviando = "sim";
        confirmar.disabled = true;

        atualizarCarrinho();
        mensagem.textContent = "Enviando seu pedido. Aguarde...";

        try {
            await fetch(URL_PLANILHA, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(dadosPedido)
            });

            mensagem.textContent =
                "Solicitação enviada. Confira a aba Pedidos da planilha antes de considerar o pedido confirmado.";

            confirmar.hidden = true;
            botaoNovo.hidden = false;
        } catch (erro) {
            console.error("Erro ao enviar pedido:", erro);

            mensagem.textContent =
                "Não foi possível confirmar o envio. Confira a planilha antes de tentar novamente para evitar duplicidade.";

            pedidoEmProcessamento = false;
            formulario.dataset.enviando = "nao";
            confirmar.disabled = false;

            atualizarCarrinho();
        }
    });
});
