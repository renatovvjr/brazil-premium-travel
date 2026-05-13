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
        title: 'History, Culture and Lifestyle',
        text: `São Paulo is the economic and cultural powerhouse of Brazil. Shaped by large waves of Italian, Japanese, Arab, and many other immigrant communities, the city became one of the most diverse urban centers in the world. This multicultural influence can be seen in its architecture, gastronomy, and vibrant lifestyle. Today, São Paulo blends tradition and modernity, bringing together museums, cultural institutions, art, business, and a cosmopolitan atmosphere that reflects the complexity and richness of Brazil.`,
      },
      {
        title: 'Why are travelers attracted to São Paulo?',
        text: `Travelers are drawn to São Paulo for its sophistication and authenticity. It is not a destination focused on traditional tourism, but rather a city for those who appreciate world-class gastronomy, urban culture, elegant neighborhoods, and genuine experiences. From rooftop bars overlooking the skyline to renowned restaurants and contemporary art centers, São Paulo attracts visitors who value depth, diversity, and a refined introduction to Brazil.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `In São Paulo, visitors can explore Ibirapuera Park, visit iconic museums such as MASP, discover stylish cafés and boutiques, enjoy internationally recognized restaurants, and experience a vibrant nightlife scene. The city also serves as the perfect starting point for a grand journey across Brazil, offering excellent infrastructure, comfort, and a dynamic first impression of the country.`,
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
        title: 'History, Culture and Lifestyle',
        text: `The Amazon is one of the most iconic regions on the planet and holds a central place in Brazil’s environmental and cultural identity. Its history is deeply connected to Indigenous communities, the vast rivers that link remote areas, and an ancestral relationship between people and the rainforest. More than a breathtaking natural landscape, the region represents cultural diversity, traditional knowledge, and a way of life shaped by the rhythm of the waters, nature, and local communities.`,
      },
      {
        title: 'Why are travelers attracted to the Amazon?',
        text: `Travelers are drawn to the Amazon because of its unique scale, extraordinary biodiversity, and the feeling of standing before something truly rare in the world. It is a destination that offers exclusivity, contemplation, and depth. For those seeking a meaningful and unforgettable journey, the Amazon represents nature on a monumental scale, silence, authenticity, and the opportunity to discover a more essential side of Brazil.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `In the Amazon, highlights include river expeditions through immense waterways, luxury lodges integrated into the rainforest, wildlife observation, contact with local traditions, and immersive experiences that connect nature and culture. The region invites travelers to slow down, observe, and experience a different kind of luxury: the privilege of being in one of the most extraordinary ecosystems on Earth.`,
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
        title: 'History, Culture and Lifestyle',
        text: `The Pantanal is one of Brazil’s most extraordinary natural regions and one of the largest wetlands in the world. Its history is deeply connected to rural life, Pantaneiro culture, and a close relationship with nature. The landscape, shaped by seasonal floods and dry periods, has influenced not only the local biodiversity but also the lifestyle of farms, communities, and regional traditions.`,
      },
      {
        title: 'Why are travelers attracted to the Pantanal?',
        text: `Travelers choose the Pantanal because it offers a rare and highly sought-after wildlife experience. For many, it is the best place in South America to observe animals in the wild, including the jaguar. The combination of dramatic landscapes, authentic rural culture, and a strong sense of exclusivity makes the Pantanal a fascinating destination for those seeking something far beyond conventional tourism.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `Among the most remarkable experiences are wildlife safaris, boat tours, horseback riding, birdwatching, and moments of contemplation in farms and lodges integrated into the natural landscape. The Pantanal provides an intense connection with nature, combined with the comfort and hospitality of a region known for its strong identity and ecological importance.`,
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
        title: 'History, Culture and Lifestyle',
        text: `Bonito has become one of Brazil’s greatest examples of organized ecotourism. The region built its reputation through environmental conservation, controlled tourism, and the protection of its rivers, caves, and natural springs. The local lifestyle is deeply connected to nature, sustainable tourism, and a strong sense of pride in preserving a rare and delicate natural heritage.`,
      },
      {
        title: 'Why are travelers attracted to Bonito?',
        text: `Travelers are drawn to Bonito because of its crystal-clear waters, preserved landscapes, and the feeling of being in a carefully protected natural paradise. It is a destination that combines visual beauty, tranquility, safety, and exclusivity. For many visitors, Bonito feels almost surreal, with transparent rivers, colorful fish, and scenery that appears untouched.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `Bonito offers experiences such as floating in transparent rivers, visiting caves, exploring waterfalls, enjoying light hiking trails, and immersing yourself in exceptionally well-preserved nature. It is the perfect destination for those seeking relaxation, breathtaking scenery, and elegant, memorable experiences surrounded by natural beauty.`,
      },
    ],
  },

  salvador: {
    title: 'Salvador',
    gallery: [
      '/images/salvador1.webp',
      '/images/salvador2.webp',
      '/images/salvador3.webp',
      '/images/salvador4.webp',
      '/images/salvador5.webp',
      '/images/salvador6.webp',
    ],
    sections: [
      {
        title: 'History, Culture and Lifestyle',
        text: `Salvador holds a central place in Brazil’s history. It was the country’s first capital and one of the most important centers in the formation of Brazilian cultural identity, especially due to its strong African influence. Its colonial architecture, spirituality, music, cuisine, and vibrant urban energy make it a truly unique destination. The lifestyle in Salvador blends tradition, spirituality, art, rhythm, and coastal living.`,
      },
      {
        title: 'Why are travelers attracted to Salvador?',
        text: `Travelers are captivated by Salvador because the city offers an intense and unforgettable cultural experience. It is a destination that goes far beyond beautiful landscapes, embracing history, music, flavors, Afro-Brazilian heritage, and a vibrant atmosphere. Visitors who come to Salvador are usually seeking authenticity, identity, and an emotionally rich experience of Brazil.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `In Salvador, highlights include the historic center, colonial churches and architecture, gastronomic experiences featuring Bahian flavors, live music, local traditions, and relaxing moments along the coastline. The city offers a rare combination of historical depth, architectural beauty, and cultural energy, making it an essential stop on a sophisticated journey through Brazil.`,
      },
    ],
  },

  'minas-gerais': {
    title: 'Minas Gerais',
    gallery: [
      '/images/minas_gerais1.webp',
      '/images/minas_gerais2.webp',
      '/images/minas_gerais3.webp',
      '/images/minas_gerais4.webp',
      '/images/minas_gerais5.webp',
      '/images/minas_gerais6.webp',
      '/images/minas_gerais7.webp',
      '/images/minas_gerais8.webp',
      '/images/minas_gerais9.webp',
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
        title: 'History, Culture and Lifestyle',
        text: `Rio de Janeiro is one of the most internationally recognized symbols of Brazil. Its history is connected to the imperial era, the country’s political and cultural development, and an identity shaped by mountains, the ocean, and vibrant urban life. The Carioca lifestyle is defined by light, natural beauty, sociability, and a unique sense of style. Rio represents a rare combination of monumental landscapes, popular culture, and sophistication.`,
      },
      {
        title: 'Why are travelers attracted to Rio de Janeiro?',
        text: `Travelers choose Rio because the city offers a combination that is almost unique in the world: iconic scenery, urban energy, glamour, beaches, and world-famous landmarks. It is a destination that immediately inspires desire, both because of its international image and the feeling of experiencing an extraordinary setting. Rio combines emotional, visual, and cultural appeal all at once.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `Among the highlights are Christ the Redeemer, Sugarloaf Mountain, panoramic viewpoints, fine dining experiences, elegant neighborhoods, vibrant nightlife, and excursions that blend nature and city life. Rio de Janeiro offers visual impact, style, and unforgettable moments, making it one of the most remarkable stages of any premium journey through Brazil.`,
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
        title: 'History, Culture and Lifestyle',
        text: `Ilha Grande is part of the image of Brazil’s most preserved tropical coastline. Surrounded by abundant nature, crystal-clear waters, and a slower pace of life, the island has built its identity around understated sophistication, natural beauty, and a true sense of escape. The local lifestyle is deeply connected to the ocean, tranquility, and the appreciation of the natural environment.`,
      },
      {
        title: 'Why are travelers attracted to Ilha Grande?',
        text: `Travelers are drawn to Ilha Grande in search of exclusivity, tropical landscapes, and a feeling of disconnecting from urban life. It is a destination that conveys lightness, privacy, and natural beauty. For those seeking a luxurious escape with transparent waters, lush vegetation, and a relaxed atmosphere, Ilha Grande is an exceptionally desirable choice.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `Highlights include private boat tours, paradise beaches, crystal-clear bays, moments of contemplation, and experiences that combine nature with comfort. Ilha Grande offers a quieter and more sensory form of luxury, ideal for travelers who wish to experience the Brazilian coastline with elegance and tranquility.`,
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
        title: 'History, Culture and Lifestyle',
        text: `Iguazu Falls holds a special place in the natural heritage of Brazil and South America. Internationally recognized, the falls are part of a region of enormous ecological and symbolic importance. More than simply a tourist attraction, they represent the overwhelming power of nature on a monumental scale and the pride of one of Brazil’s greatest natural treasures.`,
      },
      {
        title: 'Why are travelers attracted to Foz do Iguaçu?',
        text: `Travelers visit Foz do Iguaçu to experience one of the most breathtaking natural spectacles in the world. The scale of the waterfalls, the energy of the environment, and the visual impact make the experience unforgettable. It is a destination that combines emotion, contemplation, and the feeling of standing before something truly extraordinary.`,
      },
      {
        title: 'Experiences and Highlights',
        text: `Highlights include panoramic viewpoints overlooking the waterfalls, scenic tours, nature trails, and immersive experiences surrounded by the region’s lush landscapes. Foz do Iguaçu serves as a grand finale to the journey — a powerful, visually unforgettable ending worthy of a premium experience through Brazil.`,
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
            <div
              key={i}
              className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={img}
                alt={`${destination.title} ${i + 1}`}
                className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
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