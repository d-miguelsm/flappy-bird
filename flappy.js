function novoElemento(tagName, className) {
  const elem = document.createElement(tagName)
  elem.className = className
  return elem
}

function barreira(reversa = false) {
  this.elemento = novoElemento('div', 'barreira')

  const borda = novoElemento('div', 'borda')
  const corpo = novoElemento('div', 'corpo')
  this.elemento.appendChild(reversa ? corpo : borda)
  this.elemento.appendChild(reversa ? borda : corpo)

  this.setAltura = altura => corpo.style.height = `${altura}px`
}

/* 
const a = new barreira()
const b = new barreira(true)

a.setAltura(5)
b.setAltura(4)
document.querySelector('[wm-flappy]').appendChild(a.elemento)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)
*/

function parDeBarreiras(altura, abertura, posX) {
  this.elemento = novoElemento('div', 'parDeBarreiras')

  this.superior = new barreira(true)
  this.inferior = new barreira()
  this.elemento.appendChild(this.superior.elemento)
  this.elemento.appendChild(this.inferior.elemento)

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura)
    const alturaInferior = altura - abertura - alturaSuperior

    this.superior.setAltura(alturaSuperior)
    this.inferior.setAltura(alturaInferior)
  }

  this.getPosX = () => parseInt(this.elemento.style.left.split('px')[0])
  this.setPosX = posX => this.elemento.style.left = `${posX}px`
  this.getLargura = () => this.elemento.clientWidth

  this.sortearAbertura()
  this.setPosX(posX)
}

/* 
const b = new parDeBarreiras(490, 150, 600)
document.querySelector('[wm-flappy]').appendChild(b.elemento) 
*/

function criaBarreiras(altura, largura, abertura, espaco, notificarPonto, deslocamento) {
  this.pares = [
    new parDeBarreiras(altura, abertura, largura + espaco),
    new parDeBarreiras(altura, abertura, largura + espaco * 2),
    new parDeBarreiras(altura, abertura, largura + espaco * 3),
    new parDeBarreiras(altura, abertura, largura + espaco * 4)
  ]

  this.animar = () => {
    this.pares.forEach(par => {
      par.setPosX(par.getPosX() - deslocamento)

      // Quando a barreira sair da área do jogo
      if (par.getPosX() < -par.getLargura()) {
        par.setPosX(par.getPosX() + espaco * this.pares.length)
        par.sortearAbertura()
      }

      const meio = largura / 2
      const cruzouOMeio = par.getPosX() + deslocamento >= meio &&
        par.getPosX() < meio
      if (cruzouOMeio) {
        notificarPonto()
      }
    })
  }
}

function criaPassaro(alturaJogo) {
  let voando = false

  this.elemento = novoElemento('img', 'passaro')
  this.elemento.src = 'imgs/passaro.png'

  this.getPosY = () => parseInt(this.elemento.style.bottom.split('px')[0])
  this.setPosY = y => this.elemento.style.bottom = `${y}px`

  window.onkeydown = e => voando = true
  window.onkeyup = e => voando = false

  this.animar = () => {
    const novoY = this.getPosY() + (voando ? 8 : -5)
    const alturaMaxima = alturaJogo - this.elemento.clientHeight

    if (novoY <= 0) {
      this.setPosY(0)
    } else if (novoY >= alturaMaxima) {
      this.setPosY(alturaMaxima)
    } else {
      this.setPosY(novoY)
    }
  }
  this.setPosY(alturaJogo / 2)
}

/* const Barreiras = new barreiras(490, 1300, 250, 400)
const Passaro = new passaro(490)
const areaDoJogo = document.querySelector('[wm-flappy]')

areaDoJogo.appendChild(Passaro.elemento)
Barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

setInterval(() => {
  Barreiras.animar()
  Passaro.animar()
},20) */

function criaProgresso() {
  this.elemento = novoElemento('span', 'progresso')
  this.atualizarPontos = pontos => {
    this.elemento.innerHTML = pontos
  }
  this.atualizarPontos(0)
}

function aumentaNivel(pontos, deslocamento) {
  const progresso = document.getElementsByClassName('progresso')

  if (pontos >= 10) {
    deslocamento = deslocamento + 2
  }

  if (pontos >= 20) {
    deslocamento = deslocamento + 3
  }
  console.log("função", pontos, deslocamento)
  return deslocamento
}

function verificaSobreposicao(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect()
  const b = elementoB.getBoundingClientRect()


  const ladoEsqA = a.left
  const larguraA = a.width
  const topoA = a.top
  const alturaA = a.height

  const ladoEsqB = b.left
  const larguraB = b.width
  const topoB = b.top
  const alturaB = b.height

  const horizontal = ladoEsqA + larguraA >= ladoEsqB &&
    ladoEsqB + larguraB >= ladoEsqA
  const vertical = topoA + alturaA >= topoB &&
    topoB + alturaB >= topoA

  return horizontal && vertical
}

function verificaColisao(passaro, barreiras) {
  let colidiu = false

  barreiras.pares.forEach(parDeBarreiras => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento
      const inferior = parDeBarreiras.inferior.elemento
      colidiu = verificaSobreposicao(passaro.elemento, superior) ||
        verificaSobreposicao(passaro.elemento, inferior)
    }
  })

  return colidiu
}

function flappyBird() {

  const areaDoJogo = document.querySelector('[wm-flappy]')
  const altura = areaDoJogo.clientHeight
  const largura = areaDoJogo.clientWidth
  let deslocamento = 5
  let pontos = 0

  const progresso = new criaProgresso()
  const barreiras = new criaBarreiras(altura, largura, 225, 400,
    () => progresso.atualizarPontos(++pontos), deslocamento)
  const passaro = new criaPassaro(altura)

  areaDoJogo.appendChild(progresso.elemento)
  areaDoJogo.appendChild(passaro.elemento)
  barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))


  this.start = () => {
    const temporizador = setInterval(() => {
      //loop do jogo
      barreiras.animar()
      passaro.animar()

      if (verificaColisao(passaro, barreiras)) {
        location.reload()
        clearInterval(temporizador)
      }
    }, 20)

  }

}

new flappyBird().start()