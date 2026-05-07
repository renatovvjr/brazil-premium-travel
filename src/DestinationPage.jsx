import { useParams, Link } from 'react-router-dom'

const data = {
  'sao-paulo': {
    title: 'São Paulo',
    gallery: [
      '/images/sp1.webp',
      '/images/sp2.webp',
      '/images/sp3.webp',
      '/images/sp4.webp',
      '/images/sp5.webp',
      '/images/sp6.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `São Paulo é o motor econômico e cultural do Brasil. Formada por grandes ondas de imigração italiana, japonesa, árabe e de muitos outros povos, a cidade se tornou um dos centros urbanos mais diversos do mundo. Essa mistura influenciou sua arquitetura, sua gastronomia e seu estilo de vida vibrante. Hoje, São Paulo combina tradição e modernidade, reunindo museus, centros culturais, arte, negócios e uma atmosfera cosmopolita que traduz a complexidade e a riqueza do Brasil.`,
      },
      {
        title: 'Por que os viajantes são atraídos por São Paulo?',
        text: `Os viajantes procuram São Paulo por sua sofisticação e autenticidade. Não é uma cidade de turismo óbvio, mas um destino para quem aprecia gastronomia de alto nível, cultura urbana, bairros elegantes e experiências reais. De rooftops com vista para a cidade a restaurantes renomados e centros de arte contemporânea, São Paulo atrai quem valoriza profundidade, diversidade e uma introdução refinada ao Brasil.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Em São Paulo, é possível explorar o Parque Ibirapuera, visitar museus icônicos como o MASP, descobrir cafés e boutiques, experimentar restaurantes de padrão internacional e viver uma vida noturna vibrante. A cidade também funciona como um ponto de partida ideal para uma grande viagem pelo Brasil, oferecendo estrutura, conforto e uma primeira impressão dinâmica do país.`,
      },
    ],
  },

  amazon: {
    title: 'Amazon',
    gallery: [
      '/images/amazonia1.webp',
      '/images/amazonia2.webp',
      '/images/amazonia3.webp',
      '/images/amazonia4.webp',
      '/images/amazonia5.webp',
      '/images/amazonia6.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `A Amazônia é uma das regiões mais emblemáticas do planeta e ocupa um lugar central na identidade ambiental e cultural do Brasil. Sua história está profundamente ligada aos povos originários, aos rios que conectam comunidades e a uma relação ancestral entre ser humano e floresta. Mais do que um cenário natural grandioso, a região representa diversidade cultural, saberes tradicionais e uma forma de vida moldada pelo ritmo das águas, da natureza e das comunidades locais.`,
      },
      {
        title: 'Por que os viajantes são atraídos pela Amazônia?',
        text: `Os viajantes procuram a Amazônia por sua dimensão única, sua biodiversidade e pelo sentimento de estar diante de algo verdadeiramente raro no mundo. É um destino que oferece exclusividade, contemplação e profundidade. Para quem busca uma viagem marcante, a Amazônia representa natureza em escala monumental, silêncio, autenticidade e a oportunidade de conhecer uma face mais essencial do Brasil.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Na Amazônia, os destaques incluem navegação por rios imensos, hospedagens em lodges integrados à floresta, observação da fauna, contato com tradições locais e vivências que conectam natureza e cultura. A região convida a desacelerar, observar e experimentar um tipo de luxo diferente: o privilégio de estar em um dos ecossistemas mais extraordinários do planeta.`,
      },
    ],
  },

  pantanal: {
    title: 'Pantanal',
    gallery: [
      '/images/pantanal1.webp',
      '/images/pantanal2.webp',
      '/images/pantanal3.webp',
      '/images/pantanal4.webp',
      '/images/pantanal5.webp',
      '/images/pantanal6.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `O Pantanal é uma das regiões naturais mais impressionantes do Brasil e uma das maiores áreas alagáveis do mundo. Sua história está ligada à vida no campo, à cultura pantaneira e a uma convivência muito próxima com a natureza. A paisagem, marcada por ciclos de cheia e seca, moldou não apenas a biodiversidade local, mas também o modo de vida das fazendas, das comunidades e das tradições da região.`,
      },
      {
        title: 'Por que os viajantes são atraídos pelo Pantanal?',
        text: `Os viajantes escolhem o Pantanal porque ele oferece uma experiência de vida selvagem rara e altamente desejada. Para muitos, é o melhor lugar da América do Sul para observar animais em liberdade, incluindo a onça-pintada. A combinação de natureza dramática, autenticidade rural e sensação de exclusividade faz do Pantanal um destino fascinante para quem busca algo muito além do turismo convencional.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Entre as experiências mais marcantes estão os safáris fotográficos, passeios de barco, cavalgadas, observação de aves e momentos de contemplação em fazendas e lodges integrados à paisagem. O Pantanal oferece uma conexão intensa com a natureza, aliada ao conforto e à hospitalidade de uma região que tem forte identidade e grande valor ecológico.`,
      },
    ],
  },

  bonito: {
    title: 'Bonito',
    gallery: [
      '/images/bonito1.webp',
      '/images/bonito2.webp',
      '/images/bonito3.webp',
      '/images/bonito4.webp',
      '/images/bonito5.webp',
      '/images/bonito6.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `Bonito se consolidou como um dos maiores exemplos de ecoturismo organizado do Brasil. A região construiu sua reputação valorizando a conservação ambiental, o controle de visitação e a proteção de seus rios, cavernas e nascentes. O estilo de vida local está profundamente associado à natureza, ao turismo sustentável e a um sentimento de orgulho por preservar um patrimônio natural raro e delicado.`,
      },
      {
        title: 'Por que os viajantes são atraídos por Bonito?',
        text: `Os viajantes procuram Bonito por suas águas cristalinas, sua paisagem preservada e pela sensação de estar em um paraíso natural cuidadosamente protegido. É um destino que combina beleza visual, leveza, segurança e exclusividade. Para muitos, Bonito representa uma experiência quase surreal, com rios transparentes, peixes coloridos e cenários que parecem intocados.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Bonito oferece atividades como flutuação em rios transparentes, visitas a cavernas, cachoeiras, trilhas leves e experiências em meio a uma natureza extremamente bem preservada. É um destino ideal para quem quer relaxar, se impressionar com a paisagem e viver experiências suaves, elegantes e memoráveis em ambiente natural.`,
      },
    ],
  },

  salvador: {
    title: 'Salvador',
    gallery: [
      '/images/salvador.webp',
      '/images/salvador.webp',
      '/images/salvador.webp',
      '/images/salvador.webp',
      '/images/salvador.webp',
      '/images/salvador.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `Salvador ocupa um lugar central na história do Brasil. Foi a primeira capital do país e um dos maiores centros de formação da identidade cultural brasileira, especialmente pela forte influência africana. Sua arquitetura colonial, sua religiosidade, sua música, sua culinária e sua energia urbana fazem dela um destino único. O estilo de vida em Salvador mistura tradição, espiritualidade, arte, ritmo e litoral.`,
      },
      {
        title: 'Por que os viajantes são atraídos por Salvador?',
        text: `Os viajantes se encantam por Salvador porque a cidade oferece uma experiência cultural intensa e inesquecível. É um destino que não se resume a paisagens: ele envolve história, música, sabores, herança afro-brasileira e uma atmosfera vibrante. Quem visita Salvador costuma buscar autenticidade, identidade e uma vivência emocionalmente rica do Brasil.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Em Salvador, os destaques incluem o centro histórico, igrejas e construções coloniais, experiências gastronômicas com sabores baianos, música ao vivo, cultura popular e momentos de lazer no litoral. A cidade oferece uma combinação rara entre profundidade histórica, beleza arquitetônica e energia cultural, tornando-se uma etapa essencial em uma viagem sofisticada pelo Brasil.`,
      },
    ],
  },

  'minas-gerais': {
    title: 'Minas Gerais',
    gallery: [
      '/images/minas_gerais.webp',
      '/images/minas_gerais.webp',
      '/images/minas_gerais.webp',
      '/images/minas_gerais.webp',
      '/images/minas_gerais.webp',
      '/images/minas_gerais.webp',
    ],
    sections: [
    {
        title: 'History, Culture & Lifestyle',
        text: `Minas Gerais is one of the most historically significant regions in Brazil. Its past is deeply connected to the gold rush, the rise of colonial towns and the political and cultural movements that helped shape the country. Baroque churches, cobblestone streets, strong family traditions and a deeply rooted culinary heritage define the soul of the region. 

    At the same time, Belo Horizonte, the state’s capital, introduces a more contemporary dimension to the experience, with modern architecture, vibrant urban life and one of the most celebrated food scenes in Brazil. The local lifestyle blends hospitality, a slower pace of life and a quiet elegance that can be felt both in historic towns and in the capital.`,
    },
    {
        title: 'Why travellers are drawn to Minas Gerais',
        text: `Travellers are drawn to Minas Gerais for its authenticity, historical richness and its ability to offer a more refined and immersive version of Brazil. It is a destination for those who appreciate colonial architecture, outstanding cuisine and a welcoming atmosphere.

    The presence of Belo Horizonte enhances the experience, offering comfort, excellent infrastructure and access to one of the best gastronomic scenes in the country. Minas Gerais stands out for its balance between culture, history and the simple pleasure of living well.`,
    },
    {
        title: 'Experiences & Highlights',
        text: `Highlights include historic towns such as Ouro Preto, Tiradentes and Mariana, known for their colonial architecture and strong cultural identity, as well as mountainous landscapes and experiences connected to art, history and gastronomy.

    In Belo Horizonte, the journey is complemented by traditional markets, award-winning restaurants, iconic bars and easy access to cultural landmarks such as Pampulha and Inhotim. Minas Gerais offers a deeply sensory journey, where every detail — from food to architecture — reinforces a rich, elegant and memorable Brazilian identity.`,
    },
    ]
  },

  'rio-de-janeiro': {
    title: 'Rio de Janeiro',
    gallery: [
      '/images/rio_de_janeiro.webp',
      '/images/rio_de_janeiro.webp',
      '/images/rio_de_janeiro.webp',
      '/images/rio_de_janeiro.webp',
      '/images/rio_de_janeiro.webp',
      '/images/rio_de_janeiro.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `O Rio de Janeiro é um dos símbolos mais reconhecidos do Brasil no mundo. Sua história passa pelo período imperial, pela vida política e cultural do país e por uma identidade construída entre montanhas, mar e vida urbana. O estilo de vida carioca é marcado por luz, paisagem, sociabilidade e um senso de beleza muito próprio. O Rio representa uma mistura rara de natureza monumental, cultura popular e sofisticação.`,
      },
      {
        title: 'Por que os viajantes são atraídos pelo Rio de Janeiro?',
        text: `Os viajantes escolhem o Rio porque a cidade oferece uma combinação quase única no mundo: paisagens icônicas, energia urbana, glamour, praias e pontos turísticos mundialmente famosos. É um destino que desperta desejo imediato, tanto pela sua imagem internacional quanto pela sensação de viver um cenário extraordinário. O Rio tem apelo emocional, visual e cultural ao mesmo tempo.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Entre os destaques estão o Cristo Redentor, o Pão de Açúcar, vistas panorâmicas, experiências gastronômicas, bairros elegantes, vida noturna e passeios que combinam natureza e cidade. O Rio de Janeiro oferece impacto visual, estilo e momentos memoráveis, sendo uma das etapas mais marcantes de qualquer viagem premium ao Brasil.`,
      },
    ],
  },

  'ilha-grande': {
    title: 'Ilha Grande',
    gallery: [
      '/images/ilha_grande.webp',
      '/images/ilha_grande.webp',
      '/images/ilha_grande.webp',
      '/images/ilha_grande.webp',
      '/images/ilha_grande.webp',
      '/images/ilha_grande.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `Ilha Grande faz parte do imaginário do litoral brasileiro mais preservado. Com natureza abundante, mar transparente e uma atmosfera mais desacelerada, a ilha construiu sua identidade em torno da simplicidade sofisticada, da beleza natural e da sensação de refúgio. Seu estilo de vida é profundamente ligado ao mar, ao ritmo tranquilo e à valorização do ambiente natural.`,
      },
      {
        title: 'Por que os viajantes são atraídos por Ilha Grande?',
        text: `Os viajantes procuram Ilha Grande em busca de exclusividade, paisagens tropicais e uma sensação de desconexão do ritmo urbano. É um destino que transmite leveza, privacidade e beleza natural. Para quem deseja um escape de luxo com água cristalina, vegetação exuberante e clima relaxado, Ilha Grande é uma escolha muito desejada.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Os destaques incluem passeios de barco, praias paradisíacas, enseadas de água transparente, momentos de contemplação e experiências que combinam natureza e conforto. Ilha Grande oferece um luxo mais silencioso e sensorial, ideal para quem quer viver o litoral brasileiro com elegância e tranquilidade.`,
      },
    ],
  },

  'iguazu-falls': {
    title: 'Iguazu Falls',
    gallery: [
      '/images/cataratas_do_iguacu.webp',
      '/images/cataratas_do_iguacu.webp',
      '/images/cataratas_do_iguacu.webp',
      '/images/cataratas_do_iguacu.webp',
      '/images/cataratas_do_iguacu.webp',
      '/images/cataratas_do_iguacu.webp',
    ],
    sections: [
      {
        title: 'História, Cultura e Estilo de Vida',
        text: `As Cataratas do Iguaçu ocupam um lugar especial no patrimônio natural do Brasil e da América do Sul. Reconhecidas mundialmente, elas fazem parte de uma região de enorme valor ecológico e simbólico. Mais do que um ponto turístico, representam a força da natureza em escala monumental e o orgulho de um dos maiores tesouros naturais do país.`,
      },
      {
        title: 'Por que os viajantes são atraídos por Foz do Iguaçu?',
        text: `Os viajantes visitam Foz do Iguaçu porque querem vivenciar um dos espetáculos naturais mais impressionantes do mundo. A grandiosidade das quedas, a energia do lugar e o impacto visual tornam a visita inesquecível. É um destino que combina emoção, contemplação e a sensação de estar diante de algo verdadeiramente extraordinário.`,
      },
      {
        title: 'Experiências e destaques',
        text: `Entre os destaques estão os mirantes das cataratas, passeios panorâmicos, trilhas e experiências em meio à natureza exuberante da região. Foz do Iguaçu funciona como um grande final para a viagem: um encerramento poderoso, visualmente inesquecível e à altura de uma jornada premium pelo Brasil.`,
      },
    ],
  },
}

export default function DestinationPage() {
  const { name } = useParams()
  const destination = data[name]

  if (!destination) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-zinc-900">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold">Destination not found</h1>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-white transition hover:scale-105"
            >
              Back to journey
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold md:text-5xl">
          {destination.title}
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {destination.gallery.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${destination.title} ${i + 1}`}
              className="h-56 w-full rounded-xl object-cover transition duration-300 hover:scale-105"
            />
          ))}
        </div>

        <div className="mt-12 space-y-10 text-lg leading-8 text-zinc-700">
          {destination.sections.map((section, i) => (
            <div key={i}>
              <h2 className="mb-3 text-2xl font-semibold text-zinc-900">
                {section.title}
              </h2>
              <p>{section.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            to="/"
            className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-white transition hover:scale-105"
          >
            Back to journey
          </Link>
        </div>
      </div>
    </div>
  )
}