/* ============================================================
 * Encore OS — modelo de dados do protótipo
 * Filosofia: "O espetáculo é o centro de tudo."
 * Todas as entidades apontam para um Espetáculo ou são recursos
 * consumidos por ele.
 * ============================================================ */

export const formatEUR = (v: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const HOJE = "2026-08-02";

/* ---------------------------------------------------------- */
/* ORGANIZAÇÃO (entidade base — tenant)                        */
/* ---------------------------------------------------------- */

export type TipoOrganizacao =
  | "Banda"
  | "DJ"
  | "Artista"
  | "Orquestra"
  | "Empresa de Som"
  | "Empresa de Luz"
  | "Produtora"
  | "Festival";

export type Organizacao = {
  id: string;
  nome: string;
  tipo: TipoOrganizacao;
  iniciais: string;
  plano: "Pro" | "Studio" | "Enterprise";
  membros: number;
  ativa?: boolean;
};

export const organizacoes: Organizacao[] = [
  { id: "org-encore", nome: "Encore Produções", tipo: "Produtora", iniciais: "EP", plano: "Pro", membros: 29, ativa: true },
  { id: "org-atlantico", nome: "Atlântico Show", tipo: "Banda", iniciais: "AS", plano: "Studio", membros: 11 },
  { id: "org-luzsom", nome: "LuzSom Norte", tipo: "Empresa de Som", iniciais: "LS", plano: "Studio", membros: 6 },
];

/* ---------------------------------------------------------- */
/* ELENCO (bandas / projetos artísticos)                       */
/* ---------------------------------------------------------- */

export type Banda = {
  id: string;
  nome: string;
  iniciais: string;
  tipo: TipoOrganizacao;
  genero: string;
  membros: number;
  proximo: string;
  cachetMedio: number;
  cor: string;
  formacao: string;
};

export const bandas: Banda[] = [
  { id: "banda-encore", nome: "Encore Live Band", iniciais: "EL", tipo: "Banda", genero: "Baile · Pop · Latino", membros: 9, proximo: "08 Ago · Aveiro", cachetMedio: 6800, cor: "primary", formacao: "2 vozes · 5 instrumentos · 2 sopros" },
  { id: "banda-nova-onda", nome: "Nova Onda", iniciais: "NO", tipo: "Banda", genero: "Baile · Kizomba", membros: 7, proximo: "14 Ago · Bombarral", cachetMedio: 4200, cor: "success", formacao: "1 voz · 5 instrumentos · 1 sopro" },
  { id: "banda-atlantico", nome: "Atlântico Show", iniciais: "AS", tipo: "Banda", genero: "Baile · Rock Português", membros: 11, proximo: "29 Ago · Braga", cachetMedio: 7100, cor: "warning", formacao: "3 vozes · 5 instrumentos · 3 sopros" },
  { id: "banda-duo-lume", nome: "Duo Lume", iniciais: "DL", tipo: "Artista", genero: "Acústico · Cocktail", membros: 2, proximo: "02 Set · Porto", cachetMedio: 950, cor: "chart-5", formacao: "Voz + guitarra" },
];

/* ---------------------------------------------------------- */
/* PESSOAS                                                     */
/* ---------------------------------------------------------- */

export type Musico = {
  id: string;
  nome: string;
  iniciais: string;
  funcao: string;
  instrumentos: string[];
  banda: string;
  disponibilidade: "Disponível" | "Em digressão" | "Indisponível";
  motivo?: string;
  telefone: string;
  email: string;
  cachet: number;
  cartaConducao: boolean;
  conduzCarrinha: boolean;
  notas: string;
  atuacoes: number;
};

export const musicos: Musico[] = [
  { id: "mus-01", nome: "Rui Marques", iniciais: "RM", funcao: "Diretor musical", instrumentos: ["Voz", "Guitarra"], banda: "Encore Live Band", disponibilidade: "Disponível", telefone: "+351 912 004 118", email: "rui@encoreos.pt", cachet: 320, cartaConducao: true, conduzCarrinha: true, notas: "Bandleader. Fala com o cliente em palco.", atuacoes: 214 },
  { id: "mus-02", nome: "Marta Nogueira", iniciais: "MN", funcao: "Voz principal", instrumentos: ["Voz"], banda: "Nova Onda", disponibilidade: "Disponível", telefone: "+351 933 771 002", email: "marta@encoreos.pt", cachet: 300, cartaConducao: true, conduzCarrinha: false, notas: "In-ear próprio. Alergia a fumo pesado.", atuacoes: 168 },
  { id: "mus-03", nome: "Tiago Ferraz", iniciais: "TF", funcao: "Bateria", instrumentos: ["Bateria"], banda: "Atlântico Show", disponibilidade: "Em digressão", motivo: "Digressão Açores até 6 Ago", telefone: "+351 966 210 447", email: "tiago@encoreos.pt", cachet: 280, cartaConducao: true, conduzCarrinha: true, notas: "Traz bateria própria (Yamaha Stage Custom).", atuacoes: 191 },
  { id: "mus-04", nome: "Sofia Brandão", iniciais: "SB", funcao: "Teclas / Playback", instrumentos: ["Teclas", "Coros"], banda: "Encore Live Band", disponibilidade: "Disponível", telefone: "+351 917 552 903", email: "sofia@encoreos.pt", cachet: 270, cartaConducao: true, conduzCarrinha: false, notas: "Responsável por playbacks, clicks e stems.", atuacoes: 143 },
  { id: "mus-05", nome: "André Pinto", iniciais: "AP", funcao: "Baixo", instrumentos: ["Baixo"], banda: "Nova Onda", disponibilidade: "Indisponível", motivo: "Férias até 20 Ago", telefone: "+351 925 118 664", email: "andre@encoreos.pt", cachet: 250, cartaConducao: true, conduzCarrinha: true, notas: "Substituto habitual: Hugo Sá.", atuacoes: 97 },
  { id: "mus-06", nome: "Inês Cardoso", iniciais: "IC", funcao: "Sopros", instrumentos: ["Saxofone", "Percussão"], banda: "Atlântico Show", disponibilidade: "Disponível", telefone: "+351 961 330 210", email: "ines@encoreos.pt", cachet: 260, cartaConducao: false, conduzCarrinha: false, notas: "Reforço frequente da Encore Live Band.", atuacoes: 121 },
  { id: "mus-07", nome: "Hugo Sá", iniciais: "HS", funcao: "Baixo (substituto)", instrumentos: ["Baixo", "Guitarra"], banda: "Pool de substitutos", disponibilidade: "Disponível", telefone: "+351 939 442 017", email: "hugo@encoreos.pt", cachet: 220, cartaConducao: true, conduzCarrinha: true, notas: "Conhece 62% do repertório da Nova Onda.", atuacoes: 34 },
  { id: "mus-08", nome: "Nuno Aleixo", iniciais: "NA", funcao: "Técnico de som (FOH)", instrumentos: ["FOH"], banda: "Equipa técnica", disponibilidade: "Disponível", telefone: "+351 918 220 774", email: "nuno@encoreos.pt", cachet: 240, cartaConducao: true, conduzCarrinha: true, notas: "Opera X32. Responsável pela montagem PA.", atuacoes: 205 },
];

/* ---------------------------------------------------------- */
/* CRM — organizações cliente                                  */
/* ---------------------------------------------------------- */

export type TipoCliente =
  | "Comissão de Festas"
  | "Agência"
  | "Empresa"
  | "Município"
  | "Junta de Freguesia"
  | "Promotor";

export type Cliente = {
  id: string;
  nome: string;
  tipo: TipoCliente;
  localidade: string;
  contactoNome: string;
  contactoFuncao: string;
  contacto: string;
  telefone: string;
  nif: string;
  espetaculos: number;
  valor: number;
  comissao: number;
  ticketMedio: number;
  prazoPagamento: string;
  risco: "Baixo" | "Médio" | "Alto";
  estado: "Ativo" | "Lead" | "Inativo";
  desde: string;
  notas: string;
};

export const clientes: Cliente[] = [
  { id: "cli-01", nome: "Câmara Municipal de Aveiro", tipo: "Município", localidade: "Aveiro", contactoNome: "Helena Cruz", contactoFuncao: "Pelouro da Cultura", contacto: "eventos@cm-aveiro.pt", telefone: "+351 234 406 300", nif: "506 032 101", espetaculos: 6, valor: 38200, comissao: 0, ticketMedio: 6367, prazoPagamento: "60 dias após fatura", risco: "Baixo", estado: "Ativo", desde: "2022", notas: "Exige seguro de responsabilidade civil e certidões antes do evento." },
  { id: "cli-02", nome: "Agência Palco Norte", tipo: "Agência", localidade: "Braga", contactoNome: "Pedro Vilas", contactoFuncao: "Booker", contacto: "booking@palconorte.pt", telefone: "+351 253 112 044", nif: "509 774 210", espetaculos: 14, valor: 74500, comissao: 12, ticketMedio: 5321, prazoPagamento: "30 dias", risco: "Baixo", estado: "Ativo", desde: "2019", notas: "Maior parceiro. Comissão 12%. Prefere propostas em 24h." },
  { id: "cli-03", nome: "Comissão de Festas de São Pedro", tipo: "Comissão de Festas", localidade: "Ovar", contactoNome: "Joaquim Tavares", contactoFuncao: "Presidente", contacto: "festas.saopedro@gmail.com", telefone: "+351 966 004 522", nif: "513 220 887", espetaculos: 4, valor: 24800, comissao: 0, ticketMedio: 6200, prazoPagamento: "50% sinal · 50% no dia", risco: "Médio", estado: "Ativo", desde: "2021", notas: "Comissão muda de presidente todos os anos — reconfirmar contactos em Janeiro." },
  { id: "cli-04", nome: "Junta de Freguesia de Ovar", tipo: "Junta de Freguesia", localidade: "Ovar", contactoNome: "Sandra Melo", contactoFuncao: "Secretária", contacto: "geral@jf-ovar.pt", telefone: "+351 256 572 010", nif: "507 118 990", espetaculos: 2, valor: 11400, comissao: 0, ticketMedio: 5700, prazoPagamento: "45 dias", risco: "Médio", estado: "Lead", desde: "2025", notas: "Proposta da Feira Franca em avaliação até 5 Ago." },
  { id: "cli-05", nome: "Grupo Vidago Hotels", tipo: "Empresa", localidade: "Vidago", contactoNome: "Rita Salgado", contactoFuncao: "Events Manager", contacto: "eventos@vidagopalace.com", telefone: "+351 276 990 900", nif: "504 662 331", espetaculos: 3, valor: 14700, comissao: 0, ticketMedio: 4900, prazoPagamento: "30 dias", risco: "Baixo", estado: "Ativo", desde: "2023", notas: "Dress code formal. Sem pirotecnia. Volume limitado a 96 dB." },
  { id: "cli-06", nome: "Promotor Luís Faria", tipo: "Promotor", localidade: "Viana do Castelo", contactoNome: "Luís Faria", contactoFuncao: "Promotor independente", contacto: "luis@lfpromo.pt", telefone: "+351 917 330 118", nif: "221 004 776", espetaculos: 5, valor: 29800, comissao: 8, ticketMedio: 5960, prazoPagamento: "15 dias", risco: "Alto", estado: "Inativo", desde: "2020", notas: "Histórico de atrasos de pagamento em 2024. Exigir 60% de sinal." },
];

/* ---------------------------------------------------------- */
/* REPERTÓRIO — centro musical                                 */
/* ---------------------------------------------------------- */

export type Musica = {
  id: string;
  nome: string;
  artista: string;
  versao: string;
  bpm: number;
  tom: string;
  duracao: string;
  estilo: string;
  energia: number; // 1-10
  vocalista: string;
  coros: string[];
  instrumentos: string[];
  sopros: string;
  solo: string;
  backingTrack: boolean;
  clickTrack: boolean;
  stems: boolean;
  partituraPdf: boolean;
  partituraSopros: boolean;
  cifra: boolean;
  letra: string;
  videoRef: string;
  mp3: boolean;
  spotify: string;
  youtube: string;
  notasDM: string;
  ultima: string;
  atuacoes: number;
  dominio: number; // 0-100
  porEstudar: string[];
  medleys: string[];
  anterior: string;
  seguinte: string;
  tags: string[];
  publico: string;
  tipoEvento: string[];
};

export const repertorio: Musica[] = [
  {
    id: "rep-01", nome: "Bailando", artista: "Enrique Iglesias", versao: "Baile 2026 (curta)", bpm: 96, tom: "Am", duracao: "4:03",
    estilo: "Latino", energia: 9, vocalista: "Marta Nogueira", coros: ["Sofia Brandão", "Inês Cardoso"],
    instrumentos: ["Voz", "Guitarra", "Baixo", "Bateria", "Teclas", "Percussão"], sopros: "Naipe em 2ª parte (sax + trompete)",
    solo: "Guitarra espanhola · 8 compassos", backingTrack: true, clickTrack: true, stems: true,
    partituraPdf: true, partituraSopros: true, cifra: true,
    letra: "Yo te miro y se me corta la respiración\nCuando tú me miras se me sube el corazón…",
    videoRef: "Ensaio 12 Jul 2026 · Estúdio Gaia", mp3: true, spotify: "spotify:track:bailando", youtube: "youtu.be/bailando",
    notasDM: "Entrar direto do 'Danza Kuduro'. Não parar entre as duas. Marta desce uma oitava no 2º refrão.",
    ultima: "19 Jul 2026", atuacoes: 88, dominio: 96, porEstudar: [],
    medleys: ["Medley Latino"], anterior: "Danza Kuduro", seguinte: "Vem Bailar",
    tags: ["Pista cheia", "Latino", "Refrão conhecido"], publico: "Transversal · 18-55", tipoEvento: ["Festa popular", "Casamento", "Arraial"],
  },
  {
    id: "rep-02", nome: "A Minha Casinha", artista: "Xutos & Pontapés", versao: "Original", bpm: 148, tom: "E", duracao: "3:12",
    estilo: "Rock Português", energia: 10, vocalista: "Rui Marques", coros: ["Todos"],
    instrumentos: ["Voz", "Guitarra", "Baixo", "Bateria"], sopros: "Não usa", solo: "Guitarra · 16 compassos",
    backingTrack: false, clickTrack: true, stems: false, partituraPdf: false, partituraSopros: false, cifra: true,
    letra: "Vou levar-te a minha casa\nQue é feita de pau e cal…",
    videoRef: "Viana 19 Jul 2026 · câmara de palco", mp3: true, spotify: "spotify:track:casinha", youtube: "youtu.be/casinha",
    notasDM: "Cartada de fecho de 1ª parte. Público canta o refrão — baixar instrumental no último refrão.",
    ultima: "19 Jul 2026", atuacoes: 132, dominio: 100, porEstudar: [],
    medleys: ["Medley Português"], anterior: "Chamar a Música", seguinte: "Intervalo",
    tags: ["Hino", "Fecho de bloco"], publico: "30-65", tipoEvento: ["Festa popular", "Arraial", "Romaria"],
  },
  {
    id: "rep-03", nome: "Amor Perfeito", artista: "Rita Guerra", versao: "Versão casamento", bpm: 72, tom: "C", duracao: "4:21",
    estilo: "Balada", energia: 3, vocalista: "Marta Nogueira", coros: ["Sofia Brandão"],
    instrumentos: ["Voz", "Teclas", "Guitarra", "Baixo", "Bateria (vassouras)"], sopros: "Sax tenor no outro",
    solo: "Sax · 8 compassos", backingTrack: true, clickTrack: true, stems: true,
    partituraPdf: true, partituraSopros: true, cifra: true,
    letra: "Amor perfeito, o meu amor por ti\nÉ um amor sem fim…",
    videoRef: "Casamento Loridos · 05 Jul 2026", mp3: true, spotify: "spotify:track:amorperfeito", youtube: "youtu.be/amorperfeito",
    notasDM: "Primeira dança em 9 de 10 casamentos. Confirmar tom com os noivos (pode ir para Bb).",
    ultima: "05 Jul 2026", atuacoes: 54, dominio: 88, porEstudar: ["Hugo Sá"],
    medleys: [], anterior: "Abertura", seguinte: "Nada É Impossível",
    tags: ["Primeira dança", "Momento emocional"], publico: "Transversal", tipoEvento: ["Casamento", "Gala"],
  },
  {
    id: "rep-04", nome: "Danza Kuduro", artista: "Don Omar", versao: "Intro estendida", bpm: 130, tom: "Gm", duracao: "3:18",
    estilo: "Latino", energia: 10, vocalista: "Rui Marques", coros: ["Marta Nogueira"],
    instrumentos: ["Voz", "Teclas", "Baixo", "Bateria", "Percussão"], sopros: "Riff principal em uníssono",
    solo: "Percussão · 4 compassos", backingTrack: true, clickTrack: true, stems: true,
    partituraPdf: true, partituraSopros: true, cifra: false,
    letra: "La mano arriba, cintura sola\nDa media vuelta, danza kuduro…",
    videoRef: "Aveiro 2025", mp3: true, spotify: "spotify:track:kuduro", youtube: "youtu.be/kuduro",
    notasDM: "Abre o bloco latino. Intro de 16 compassos para a pista encher.",
    ultima: "19 Jul 2026", atuacoes: 104, dominio: 98, porEstudar: [],
    medleys: ["Medley Latino"], anterior: "Chamar a Música", seguinte: "Bailando",
    tags: ["Pista cheia", "Abertura de bloco"], publico: "18-45", tipoEvento: ["Festa popular", "Arraial", "Casamento"],
  },
  {
    id: "rep-05", nome: "Cavaleiro Andante", artista: "Quim Barreiros", versao: "Baile", bpm: 118, tom: "D", duracao: "3:45",
    estilo: "Popular", energia: 8, vocalista: "Rui Marques", coros: ["Todos"],
    instrumentos: ["Voz", "Acordeão", "Baixo", "Bateria", "Teclas"], sopros: "Naipe no refrão",
    solo: "Acordeão · 8 compassos", backingTrack: false, clickTrack: false, stems: false,
    partituraPdf: false, partituraSopros: true, cifra: true,
    letra: "Ó cavaleiro andante, sobe a serra devagar…",
    videoRef: "Romaria 2025", mp3: true, spotify: "spotify:track:cavaleiro", youtube: "youtu.be/cavaleiro",
    notasDM: "Obrigatória em romarias do Norte. Nunca tocar antes das 23h30.",
    ultima: "28 Jun 2026", atuacoes: 76, dominio: 92, porEstudar: ["Sofia Brandão"],
    medleys: ["Medley Popular"], anterior: "Vem Bailar", seguinte: "A Minha Casinha",
    tags: ["Romaria", "Pedido frequente"], publico: "40-70", tipoEvento: ["Romaria", "Arraial", "Festa popular"],
  },
  {
    id: "rep-06", nome: "Nada É Impossível", artista: "Toranja", versao: "Original", bpm: 84, tom: "Bm", duracao: "4:35",
    estilo: "Pop Rock PT", energia: 5, vocalista: "Sofia Brandão", coros: ["Marta Nogueira"],
    instrumentos: ["Voz", "Guitarra", "Teclas", "Baixo", "Bateria"], sopros: "Não usa", solo: "Guitarra · 12 compassos",
    backingTrack: false, clickTrack: true, stems: false, partituraPdf: true, partituraSopros: false, cifra: true,
    letra: "Nada é impossível, tudo se transforma…",
    videoRef: "Ensaio 12 Jul 2026", mp3: true, spotify: "spotify:track:nadaeimpossivel", youtube: "youtu.be/nadaeimpossivel",
    notasDM: "Boa para descer energia sem perder pista. Cuidado com o tom da Sofia depois de 2h de set.",
    ultima: "12 Jul 2026", atuacoes: 41, dominio: 74, porEstudar: ["Inês Cardoso", "Hugo Sá"],
    medleys: [], anterior: "Amor Perfeito", seguinte: "Chamar a Música",
    tags: ["Transição", "Meia energia"], publico: "25-50", tipoEvento: ["Casamento", "Gala", "Festa popular"],
  },
  {
    id: "rep-07", nome: "Chamar a Música", artista: "Santos & Pecadores", versao: "Original", bpm: 108, tom: "G", duracao: "4:02",
    estilo: "Pop Rock PT", energia: 7, vocalista: "Rui Marques", coros: ["Sofia Brandão", "Marta Nogueira"],
    instrumentos: ["Voz", "Guitarra", "Teclas", "Baixo", "Bateria"], sopros: "Naipe no último refrão",
    solo: "Teclas · 8 compassos", backingTrack: false, clickTrack: true, stems: false,
    partituraPdf: true, partituraSopros: true, cifra: true,
    letra: "Vem chamar a música que dorme dentro de ti…",
    videoRef: "Viana 19 Jul 2026", mp3: true, spotify: "spotify:track:chamaramusica", youtube: "youtu.be/chamaramusica",
    notasDM: "Rampa de subida perfeita antes do bloco latino.",
    ultima: "19 Jul 2026", atuacoes: 69, dominio: 90, porEstudar: [],
    medleys: ["Medley Português"], anterior: "Nada É Impossível", seguinte: "Danza Kuduro",
    tags: ["Rampa", "Coro forte"], publico: "25-55", tipoEvento: ["Festa popular", "Casamento"],
  },
  {
    id: "rep-08", nome: "Vem Bailar", artista: "Ala dos Namorados", versao: "Baile 2026", bpm: 126, tom: "F", duracao: "3:30",
    estilo: "Pimba Pop", energia: 9, vocalista: "Marta Nogueira", coros: ["Todos"],
    instrumentos: ["Voz", "Acordeão", "Guitarra", "Baixo", "Bateria", "Teclas"], sopros: "Naipe completo",
    solo: "Sax · 8 compassos", backingTrack: true, clickTrack: true, stems: false,
    partituraPdf: true, partituraSopros: true, cifra: true,
    letra: "Vem bailar comigo, vem bailar…",
    videoRef: "Ovar 2025", mp3: true, spotify: "spotify:track:vembailar", youtube: "youtu.be/vembailar",
    notasDM: "Fecho do bloco popular. Deixar espaço para o público repetir o refrão duas vezes.",
    ultima: "05 Jul 2026", atuacoes: 83, dominio: 94, porEstudar: [],
    medleys: ["Medley Popular"], anterior: "Bailando", seguinte: "Cavaleiro Andante",
    tags: ["Pista cheia", "Fecho de bloco"], publico: "30-65", tipoEvento: ["Arraial", "Romaria", "Festa popular"],
  },
];

export const medleys = [
  { id: "med-1", nome: "Medley Latino", musicas: ["Danza Kuduro", "Bailando"], duracao: "7:21", energia: 10 },
  { id: "med-2", nome: "Medley Português", musicas: ["Chamar a Música", "A Minha Casinha"], duracao: "7:14", energia: 9 },
  { id: "med-3", nome: "Medley Popular", musicas: ["Vem Bailar", "Cavaleiro Andante"], duracao: "7:15", energia: 8 },
];

export const porAprender = [
  { id: "pa-1", musica: "Ai Se Eu Te Pego", artista: "Michel Teló", prazo: "10 Ago", responsavel: "Todos", progresso: 40 },
  { id: "pa-2", musica: "Espalha Brasas", artista: "Quim Barreiros", prazo: "16 Ago", responsavel: "Naipe de sopros", progresso: 65 },
  { id: "pa-3", musica: "Deixa-me Rir", artista: "Fernando Daniel", prazo: "24 Ago", responsavel: "Sofia Brandão", progresso: 15 },
];

/* ---------------------------------------------------------- */
/* EQUIPAMENTOS                                                */
/* ---------------------------------------------------------- */

export type Equipamento = {
  id: string;
  nome: string;
  categoria: "Som" | "Luz" | "Estrutura" | "Energia" | "Backline";
  marca: string;
  modelo: string;
  serie: string;
  codigoInterno: string;
  qr: string;
  valor: number;
  fornecedor: string;
  garantiaAte: string;
  dataCompra: string;
  seguro: string;
  estado: "Operacional" | "Manutenção" | "Avariado";
  localizacao: string;
  flightCase: string;
  transportadoPor: string;
  ultimaManutencao: string;
  proximaManutencao: string;
  manual: string;
  historico: { data: string; evento: string }[];
  observacoes: string;
};

export const equipamentos: Equipamento[] = [
  {
    id: "eq-01", nome: "PA RCF HDL 20-A (par)", categoria: "Som", marca: "RCF", modelo: "HDL 20-A", serie: "RCF-20A-8841",
    codigoInterno: "SOM-0001", qr: "ENC-SOM-0001", valor: 14800, fornecedor: "Garrett Audio", garantiaAte: "12 Mar 2027",
    dataCompra: "12 Mar 2024", seguro: "Fidelidade · Apólice 4482119", estado: "Operacional", localizacao: "Armazém Gaia",
    flightCase: "Case A1 (rodas)", transportadoPor: "Carrinha 1 · Nuno Aleixo", ultimaManutencao: "12 Mai 2026",
    proximaManutencao: "12 Nov 2026", manual: "rcf-hdl20a-manual.pdf",
    historico: [
      { data: "12 Mai 2026", evento: "Revisão de amplificadores e limpeza de drivers" },
      { data: "19 Jul 2026", evento: "Utilizado em Romaria da Senhora da Agonia" },
    ],
    observacoes: "Verificar sempre o cabo de link L/R — já falhou duas vezes em exterior.",
  },
  {
    id: "eq-02", nome: "Mesa Behringer X32", categoria: "Som", marca: "Behringer", modelo: "X32 Compact", serie: "BEH-X32-2210",
    codigoInterno: "SOM-0014", qr: "ENC-SOM-0014", valor: 2400, fornecedor: "Thomann", garantiaAte: "02 Jun 2027",
    dataCompra: "02 Jun 2023", seguro: "Fidelidade · Apólice 4482119", estado: "Operacional", localizacao: "Carrinha 1",
    flightCase: "Case FOH", transportadoPor: "Carrinha 1 · Nuno Aleixo", ultimaManutencao: "02 Jun 2026",
    proximaManutencao: "02 Dez 2026", manual: "x32-manual.pdf",
    historico: [
      { data: "02 Jun 2026", evento: "Atualização de firmware 4.06" },
      { data: "19 Jul 2026", evento: "Cena guardada: Atlântico Show Romaria" },
    ],
    observacoes: "Cenas por banda guardadas nos slots 1-4.",
  },
  {
    id: "eq-03", nome: "Movings Robe Pointe (x8)", categoria: "Luz", marca: "Robe", modelo: "Pointe", serie: "ROB-PT-0031",
    codigoInterno: "LUZ-0031", qr: "ENC-LUZ-0031", valor: 32000, fornecedor: "Iluminação Norte", garantiaAte: "Expirada",
    dataCompra: "08 Fev 2021", seguro: "Fidelidade · Apólice 4482119", estado: "Manutenção", localizacao: "Oficina Braga",
    flightCase: "Case L2 e L3", transportadoPor: "Carrinha 2 · Tiago Ferraz", ultimaManutencao: "21 Jul 2026",
    proximaManutencao: "05 Ago 2026", manual: "robe-pointe.pdf",
    historico: [
      { data: "21 Jul 2026", evento: "Entrada em oficina — 2 unidades com erro de pan" },
      { data: "05 Ago 2026", evento: "Devolução prevista" },
    ],
    observacoes: "Só 6 unidades disponíveis até 5 Ago. Planear desenho de luz com 6.",
  },
  {
    id: "eq-04", nome: "Truss Alumínio 12m", categoria: "Estrutura", marca: "Prolyte", modelo: "H30V", serie: "PRO-H30-0007",
    codigoInterno: "EST-0007", qr: "ENC-EST-0007", valor: 5600, fornecedor: "Prolyte Iberia", garantiaAte: "30 Abr 2028",
    dataCompra: "30 Abr 2022", seguro: "Fidelidade · Apólice 4482119", estado: "Operacional", localizacao: "Armazém Gaia",
    flightCase: "Sem case · cintas", transportadoPor: "Carrinha 2 · Tiago Ferraz", ultimaManutencao: "30 Abr 2026",
    proximaManutencao: "30 Abr 2027", manual: "prolyte-h30v.pdf",
    historico: [{ data: "30 Abr 2026", evento: "Inspeção estrutural anual — aprovada" }],
    observacoes: "Requer 4 pessoas na montagem. Certificado de carga na pasta de documentos.",
  },
  {
    id: "eq-05", nome: "In-ear Shure PSM300 (x6)", categoria: "Som", marca: "Shure", modelo: "PSM300", serie: "SHU-P300-0045",
    codigoInterno: "SOM-0045", qr: "ENC-SOM-0045", valor: 4200, fornecedor: "Garrett Audio", garantiaAte: "18 Jan 2027",
    dataCompra: "18 Jan 2025", seguro: "Não segurado", estado: "Avariado", localizacao: "Armazém Gaia",
    flightCase: "Case Rack 4U", transportadoPor: "Carrinha 1 · Nuno Aleixo", ultimaManutencao: "18 Jul 2026",
    proximaManutencao: "Aguarda orçamento", manual: "psm300.pdf",
    historico: [
      { data: "18 Jul 2026", evento: "Unidade 3 sem saída de áudio" },
      { data: "22 Jul 2026", evento: "Orçamento de reparação pedido — 340 €" },
    ],
    observacoes: "Só 5 canais operacionais. Marta precisa de garantia de canal próprio.",
  },
  {
    id: "eq-06", nome: "Gerador 15kVA", categoria: "Energia", marca: "Pramac", modelo: "GSW15", serie: "PRA-15-0002",
    codigoInterno: "ENE-0002", qr: "ENC-ENE-0002", valor: 9800, fornecedor: "Pramac PT", garantiaAte: "09 Jan 2028",
    dataCompra: "09 Jan 2024", seguro: "Fidelidade · Apólice 4482119", estado: "Operacional", localizacao: "Carrinha 2",
    flightCase: "Reboque", transportadoPor: "Carrinha 2 · Tiago Ferraz", ultimaManutencao: "09 Jul 2026",
    proximaManutencao: "09 Jan 2027", manual: "pramac-gsw15.pdf",
    historico: [{ data: "09 Jul 2026", evento: "Mudança de óleo e filtros · 412 h" }],
    observacoes: "Levar sempre 40 L de gasóleo extra em festas de rua.",
  },
];

/* ---------------------------------------------------------- */
/* ESPETÁCULO — entidade central                               */
/* ---------------------------------------------------------- */

export type Estado = "Confirmado" | "Proposta" | "Reservado" | "Concluído" | "Cancelado";

export type EventoTimeline = { hora: string; titulo: string; detalhe: string; feito?: boolean };
export type ItemChecklist = { id: string; texto: string; responsavel: string; feito: boolean };
export type Checklist = { id: string; nome: string; icone: string; itens: ItemChecklist[] };
export type Mensagem = { id: string; autor: string; iniciais: string; texto: string; quando: string; lidoPor: number; anexo?: string };

export type Espetaculo = {
  id: string;
  nome: string;
  banda: string;
  bandaId: string;
  estado: Estado;
  data: string;
  hora: string;
  fim: string;
  cliente: string;
  clienteId: string;
  tipoEvento: string;
  local: string;
  morada: string;
  distanciaKm: number;
  duracaoViagem: string;
  horaSaida: string;
  publicoEstimado: number;
  preco: number;
  custos: number;
  contrato: "Assinado" | "Pendente" | "Enviado" | "N/A";
  responsavel: string;
  palco: string;
  energia: string;
  alojamento: string;
  refeicoes: string;
  meteo: { estado: string; temp: number; vento: string; chuva: number };
  equipa: { musicoId: string; papel: string; confirmado: boolean }[];
  setlist: { bloco: string; musicas: string[] }[];
  equipamentos: string[];
  timeline: EventoTimeline[];
  checklists: Checklist[];
  documentos: { nome: string; tipo: string; estado: string }[];
  mensagens: Mensagem[];
  riscos: string[];
};

const checklistBase = (donoA: string, donoB: string): Checklist[] => [
  {
    id: "ck-eq", nome: "Equipamentos", icone: "Boxes", itens: [
      { id: "e1", texto: "Conferir PA e amplificação", responsavel: donoA, feito: true },
      { id: "e2", texto: "Carregar in-ears e baterias", responsavel: donoA, feito: true },
      { id: "e3", texto: "Verificar cabos XLR sobresselentes", responsavel: donoB, feito: false },
    ],
  },
  {
    id: "ck-tr", nome: "Transporte", icone: "Truck", itens: [
      { id: "t1", texto: "Abastecer carrinha 1", responsavel: donoB, feito: true },
      { id: "t2", texto: "Confirmar via verde e portagens", responsavel: donoB, feito: false },
      { id: "t3", texto: "Distribuir boleias pela equipa", responsavel: donoA, feito: false },
    ],
  },
  {
    id: "ck-mo", nome: "Montagem", icone: "Hammer", itens: [
      { id: "m1", texto: "Truss e elevadores", responsavel: donoB, feito: false },
      { id: "m2", texto: "Backline em palco", responsavel: donoA, feito: false },
      { id: "m3", texto: "Tapete de bateria e marcações", responsavel: donoA, feito: false },
    ],
  },
  {
    id: "ck-som", nome: "Som", icone: "Volume2", itens: [
      { id: "s1", texto: "Carregar cena X32", responsavel: "Nuno Aleixo", feito: false },
      { id: "s2", texto: "Line check completo", responsavel: "Nuno Aleixo", feito: false },
      { id: "s3", texto: "Testar in-ears de todos os elementos", responsavel: "Sofia Brandão", feito: false },
    ],
  },
  {
    id: "ck-luz", nome: "Luz", icone: "Lightbulb", itens: [
      { id: "l1", texto: "Patch e endereçamento DMX", responsavel: donoB, feito: false },
      { id: "l2", texto: "Cenas por bloco de setlist", responsavel: donoB, feito: false },
    ],
  },
  {
    id: "ck-bs", nome: "Backstage", icone: "DoorOpen", itens: [
      { id: "b1", texto: "Camarim e água", responsavel: donoA, feito: false },
      { id: "b2", texto: "Toalhas e catering", responsavel: donoA, feito: false },
    ],
  },
  {
    id: "ck-doc", nome: "Documentação", icone: "FileText", itens: [
      { id: "d1", texto: "Contrato assinado em pasta", responsavel: donoA, feito: true },
      { id: "d2", texto: "Seguro RC e certidões", responsavel: donoA, feito: true },
      { id: "d3", texto: "Licença de ruído do promotor", responsavel: donoA, feito: false },
    ],
  },
  {
    id: "ck-fin", nome: "Financeiro", icone: "Wallet", itens: [
      { id: "f1", texto: "Sinal recebido", responsavel: "Rui Marques", feito: true },
      { id: "f2", texto: "Cachets da equipa preparados", responsavel: "Rui Marques", feito: false },
      { id: "f3", texto: "Recibo/fatura emitida", responsavel: "Rui Marques", feito: false },
    ],
  },
  {
    id: "ck-des", nome: "Desmontagem", icone: "PackageOpen", itens: [
      { id: "x1", texto: "Inventário de retorno por QR", responsavel: donoB, feito: false },
      { id: "x2", texto: "Registar avarias detetadas", responsavel: donoB, feito: false },
    ],
  },
];

const timelineBase = (saida: string): EventoTimeline[] => [
  { hora: saida, titulo: "Saída", detalhe: "Armazém Gaia · carrinha 1 e 2", feito: false },
  { hora: "16:00", titulo: "Chegada", detalhe: "Descarga junto ao palco", feito: false },
  { hora: "16:30", titulo: "Montagem", detalhe: "PA, truss, backline", feito: false },
  { hora: "18:00", titulo: "Soundcheck", detalhe: "Line check + 3 temas", feito: false },
  { hora: "20:00", titulo: "Jantar", detalhe: "Refeição fornecida pelo promotor", feito: false },
  { hora: "22:00", titulo: "Espetáculo", detalhe: "2 blocos de 75 min", feito: false },
  { hora: "02:00", titulo: "Desmontagem", detalhe: "Inventário QR de retorno", feito: false },
  { hora: "03:30", titulo: "Regresso", detalhe: "Chegada prevista ao armazém", feito: false },
];

const setlistBase = [
  { bloco: "Bloco 1 · Aquecimento", musicas: ["Amor Perfeito", "Nada É Impossível", "Chamar a Música"] },
  { bloco: "Bloco 2 · Latino", musicas: ["Danza Kuduro", "Bailando", "Vem Bailar"] },
  { bloco: "Bloco 3 · Fecho", musicas: ["Cavaleiro Andante", "A Minha Casinha"] },
];

const mensagensBase = (evento: string): Mensagem[] => [
  { id: "m1", autor: "Rui Marques", iniciais: "RM", texto: `Equipa, confirmem presença para ${evento}. Saída pontual, não esperamos por ninguém.`, quando: "ontem 18:12", lidoPor: 8 },
  { id: "m2", autor: "Nuno Aleixo", iniciais: "NA", texto: "Palco confirmado com 10x8m. Levo o rack completo.", quando: "ontem 19:40", lidoPor: 7, anexo: "planta-palco.pdf" },
  { id: "m3", autor: "Sofia Brandão", iniciais: "SB", texto: "Playbacks atualizados na pasta. Bailando está na versão curta.", quando: "hoje 09:05", lidoPor: 5 },
  { id: "m4", autor: "Marta Nogueira", iniciais: "MN", texto: "Só chego às 16:30, venho direta do Porto.", quando: "hoje 10:22", lidoPor: 4 },
];

export const espetaculos: Espetaculo[] = [
  {
    id: "esp-1041", nome: "Festas de São Pedro", banda: "Encore Live Band", bandaId: "banda-encore", estado: "Confirmado",
    data: "2026-08-08", hora: "22:30", fim: "02:00", cliente: "Comissão de Festas de São Pedro", clienteId: "cli-03",
    tipoEvento: "Festa popular", local: "Praça do Peixe, Aveiro", morada: "Praça do Peixe, 3800-000 Aveiro",
    distanciaKm: 78, duracaoViagem: "1h05", horaSaida: "14:00", publicoEstimado: 4500, preco: 6500, custos: 2380,
    contrato: "Assinado", responsavel: "Rui Marques", palco: "10 x 8 m coberto", energia: "Quadro 63A trifásico no local",
    alojamento: "Sem dormida", refeicoes: "Jantar para 11 fornecido",
    meteo: { estado: "Céu limpo", temp: 26, vento: "12 km/h NO", chuva: 5 },
    equipa: [
      { musicoId: "mus-01", papel: "Voz / Guitarra / DM", confirmado: true },
      { musicoId: "mus-04", papel: "Teclas / Playback", confirmado: true },
      { musicoId: "mus-06", papel: "Sax / Percussão", confirmado: true },
      { musicoId: "mus-08", papel: "FOH", confirmado: true },
      { musicoId: "mus-07", papel: "Baixo", confirmado: false },
    ],
    setlist: setlistBase, equipamentos: ["eq-01", "eq-02", "eq-04", "eq-06"],
    timeline: timelineBase("14:00"), checklists: checklistBase("Rui Marques", "Nuno Aleixo"),
    documentos: [
      { nome: "Contrato assinado", tipo: "PDF", estado: "Assinado" },
      { nome: "Rider técnico v3", tipo: "PDF", estado: "Enviado" },
      { nome: "Seguro RC", tipo: "PDF", estado: "Válido" },
      { nome: "Licença de ruído", tipo: "PDF", estado: "Pendente" },
    ],
    mensagens: mensagensBase("as Festas de São Pedro"),
    riscos: ["Licença de ruído ainda por receber do promotor", "Hugo Sá ainda não confirmou presença"],
  },
  {
    id: "esp-1042", nome: "Casamento Silva & Costa", banda: "Nova Onda", bandaId: "banda-nova-onda", estado: "Confirmado",
    data: "2026-08-14", hora: "23:00", fim: "03:00", cliente: "Grupo Vidago Hotels", clienteId: "cli-05",
    tipoEvento: "Casamento", local: "Quinta dos Loridos, Bombarral", morada: "EN8, 2540-000 Bombarral",
    distanciaKm: 264, duracaoViagem: "2h40", horaSaida: "15:00", publicoEstimado: 180, preco: 3800, custos: 1640,
    contrato: "Assinado", responsavel: "Marta Nogueira", palco: "8 x 6 m interior", energia: "Rede da quinta · 32A",
    alojamento: "1 noite · Hotel Bombarral", refeicoes: "Jantar dos noivos incluído",
    meteo: { estado: "Parcialmente nublado", temp: 24, vento: "8 km/h O", chuva: 15 },
    equipa: [
      { musicoId: "mus-02", papel: "Voz principal", confirmado: true },
      { musicoId: "mus-04", papel: "Teclas", confirmado: true },
      { musicoId: "mus-07", papel: "Baixo (subst. André)", confirmado: true },
      { musicoId: "mus-08", papel: "FOH", confirmado: true },
    ],
    setlist: [
      { bloco: "Cocktail", musicas: ["Amor Perfeito", "Nada É Impossível"] },
      { bloco: "Primeira dança", musicas: ["Amor Perfeito"] },
      { bloco: "Bloco de pista", musicas: ["Danza Kuduro", "Bailando", "Vem Bailar", "Chamar a Música"] },
    ],
    equipamentos: ["eq-02", "eq-05"], timeline: timelineBase("15:00"),
    checklists: checklistBase("Marta Nogueira", "Nuno Aleixo"),
    documentos: [
      { nome: "Contrato assinado", tipo: "PDF", estado: "Assinado" },
      { nome: "Lista de músicas dos noivos", tipo: "DOC", estado: "Recebido" },
      { nome: "Planta da sala", tipo: "PDF", estado: "Recebido" },
    ],
    mensagens: mensagensBase("o casamento Silva & Costa"),
    riscos: ["André Pinto de férias — substituído por Hugo Sá", "Volume limitado a 96 dB pelo espaço"],
  },
  {
    id: "esp-1043", nome: "Feira Franca", banda: "Encore Live Band", bandaId: "banda-encore", estado: "Proposta",
    data: "2026-08-21", hora: "21:00", fim: "01:00", cliente: "Junta de Freguesia de Ovar", clienteId: "cli-04",
    tipoEvento: "Arraial", local: "Parque Urbano, Ovar", morada: "Parque Urbano, 3880-000 Ovar",
    distanciaKm: 52, duracaoViagem: "45 min", horaSaida: "14:30", publicoEstimado: 2500, preco: 7200, custos: 2650,
    contrato: "Enviado", responsavel: "Rui Marques", palco: "12 x 10 m com cobertura", energia: "Gerador nosso",
    alojamento: "Sem dormida", refeicoes: "A confirmar",
    meteo: { estado: "Aguaceiros", temp: 21, vento: "24 km/h N", chuva: 65 },
    equipa: [
      { musicoId: "mus-01", papel: "Voz / Guitarra / DM", confirmado: true },
      { musicoId: "mus-04", papel: "Teclas", confirmado: false },
      { musicoId: "mus-06", papel: "Sax", confirmado: false },
    ],
    setlist: setlistBase, equipamentos: ["eq-01", "eq-03", "eq-04", "eq-06"],
    timeline: timelineBase("14:30"), checklists: checklistBase("Rui Marques", "Tiago Ferraz"),
    documentos: [
      { nome: "Proposta comercial", tipo: "PDF", estado: "Enviado" },
      { nome: "Rider técnico v3", tipo: "PDF", estado: "Enviado" },
    ],
    mensagens: mensagensBase("a Feira Franca"),
    riscos: ["65% de probabilidade de chuva — cobertura de palco obrigatória", "Contrato por assinar a 19 dias do evento"],
  },
  {
    id: "esp-1044", nome: "Noite Branca", banda: "Atlântico Show", bandaId: "banda-atlantico", estado: "Reservado",
    data: "2026-08-29", hora: "00:30", fim: "04:00", cliente: "Agência Palco Norte", clienteId: "cli-02",
    tipoEvento: "Festa de rua", local: "Avenida Central, Braga", morada: "Av. Central, 4710-000 Braga",
    distanciaKm: 96, duracaoViagem: "1h10", horaSaida: "16:00", publicoEstimado: 12000, preco: 5400, custos: 2210,
    contrato: "Pendente", responsavel: "Tiago Ferraz", palco: "14 x 12 m municipal", energia: "Fornecida pelo município",
    alojamento: "1 noite · Hotel Braga Centro", refeicoes: "Catering do promotor",
    meteo: { estado: "Céu limpo", temp: 23, vento: "10 km/h S", chuva: 0 },
    equipa: [
      { musicoId: "mus-03", papel: "Bateria", confirmado: false },
      { musicoId: "mus-06", papel: "Sax / Percussão", confirmado: true },
      { musicoId: "mus-08", papel: "FOH", confirmado: true },
    ],
    setlist: setlistBase, equipamentos: ["eq-01", "eq-02", "eq-03"],
    timeline: timelineBase("16:00"), checklists: checklistBase("Tiago Ferraz", "Nuno Aleixo"),
    documentos: [
      { nome: "Contrato", tipo: "PDF", estado: "Pendente" },
      { nome: "Rider técnico v3", tipo: "PDF", estado: "Enviado" },
    ],
    mensagens: mensagensBase("a Noite Branca"),
    riscos: ["Contrato pendente há 11 dias", "Movings Robe em manutenção até 5 Ago"],
  },
  {
    id: "esp-1045", nome: "Gala de Verão", banda: "Nova Onda", bandaId: "banda-nova-onda", estado: "Confirmado",
    data: "2026-09-05", hora: "22:00", fim: "01:30", cliente: "Grupo Vidago Hotels", clienteId: "cli-05",
    tipoEvento: "Gala", local: "Hotel Vidago Palace", morada: "Parque de Vidago, 5425-307 Vidago",
    distanciaKm: 148, duracaoViagem: "1h50", horaSaida: "15:30", publicoEstimado: 320, preco: 4900, custos: 1980,
    contrato: "Assinado", responsavel: "Marta Nogueira", palco: "10 x 7 m salão nobre", energia: "Rede do hotel",
    alojamento: "1 noite no hotel", refeicoes: "Jantar de gala",
    meteo: { estado: "Céu limpo", temp: 22, vento: "6 km/h E", chuva: 5 },
    equipa: [
      { musicoId: "mus-02", papel: "Voz principal", confirmado: true },
      { musicoId: "mus-04", papel: "Teclas", confirmado: true },
      { musicoId: "mus-05", papel: "Baixo", confirmado: true },
    ],
    setlist: setlistBase, equipamentos: ["eq-02", "eq-05"],
    timeline: timelineBase("15:30"), checklists: checklistBase("Marta Nogueira", "Nuno Aleixo"),
    documentos: [{ nome: "Contrato assinado", tipo: "PDF", estado: "Assinado" }],
    mensagens: mensagensBase("a Gala de Verão"),
    riscos: ["Dress code formal obrigatório"],
  },
  {
    id: "esp-1046", nome: "Romaria da Senhora da Agonia", banda: "Atlântico Show", bandaId: "banda-atlantico", estado: "Concluído",
    data: "2026-07-19", hora: "23:30", fim: "03:00", cliente: "Promotor Luís Faria", clienteId: "cli-06",
    tipoEvento: "Romaria", local: "Viana do Castelo", morada: "Campo da Agonia, Viana do Castelo",
    distanciaKm: 132, duracaoViagem: "1h35", horaSaida: "15:00", publicoEstimado: 18000, preco: 8300, custos: 3120,
    contrato: "Assinado", responsavel: "Tiago Ferraz", palco: "16 x 12 m", energia: "Município",
    alojamento: "1 noite", refeicoes: "Catering",
    meteo: { estado: "Céu limpo", temp: 25, vento: "14 km/h N", chuva: 0 },
    equipa: [
      { musicoId: "mus-03", papel: "Bateria", confirmado: true },
      { musicoId: "mus-06", papel: "Sax", confirmado: true },
      { musicoId: "mus-08", papel: "FOH", confirmado: true },
    ],
    setlist: setlistBase, equipamentos: ["eq-01", "eq-02"],
    timeline: timelineBase("15:00"), checklists: checklistBase("Tiago Ferraz", "Nuno Aleixo"),
    documentos: [{ nome: "Contrato assinado", tipo: "PDF", estado: "Assinado" }],
    mensagens: mensagensBase("a Romaria"),
    riscos: [],
  },
  {
    id: "esp-1047", nome: "Arraial da Fábrica", banda: "Encore Live Band", bandaId: "banda-encore", estado: "Cancelado",
    data: "2026-07-11", hora: "22:00", fim: "01:00", cliente: "Agência Palco Norte", clienteId: "cli-02",
    tipoEvento: "Festa de empresa", local: "Santa Maria da Feira", morada: "Parque Industrial, SMF",
    distanciaKm: 34, duracaoViagem: "35 min", horaSaida: "16:00", publicoEstimado: 600, preco: 4100, custos: 0,
    contrato: "N/A", responsavel: "Rui Marques", palco: "—", energia: "—", alojamento: "—", refeicoes: "—",
    meteo: { estado: "—", temp: 0, vento: "—", chuva: 0 },
    equipa: [], setlist: [], equipamentos: [], timeline: [], checklists: [],
    documentos: [], mensagens: [], riscos: ["Cancelado pelo cliente a 3 dias — retido sinal de 25%"],
  },
];

export const getEspetaculo = (id: string) => espetaculos.find((e) => e.id === id);
export const getMusico = (id: string) => musicos.find((m) => m.id === id);
export const getEquipamento = (id: string) => equipamentos.find((e) => e.id === id);
export const getMusica = (nome: string) => repertorio.find((m) => m.nome === nome);
export const getCliente = (id: string) => clientes.find((c) => c.id === id);

/* ---------------------------------------------------------- */
/* ENSAIOS                                                     */
/* ---------------------------------------------------------- */

export const ensaios = [
  { id: "ens-1", data: "2026-08-04", hora: "21:00", banda: "Encore Live Band", local: "Estúdio Gaia", foco: "Bloco latino + 2 temas novos", confirmados: 7, total: 9 },
  { id: "ens-2", data: "2026-08-06", hora: "21:30", banda: "Nova Onda", local: "Estúdio Gaia", foco: "Integrar Hugo Sá no set de casamento", confirmados: 5, total: 7 },
  { id: "ens-3", data: "2026-08-12", hora: "21:00", banda: "Encore Live Band", local: "Estúdio Gaia", foco: "Passagem geral Feira Franca", confirmados: 4, total: 9 },
];

/* ---------------------------------------------------------- */
/* FINANCEIRO                                                  */
/* ---------------------------------------------------------- */

export const receitaMensal = [
  { mes: "Fev", receita: 18400, despesa: 9200 },
  { mes: "Mar", receita: 22100, despesa: 10400 },
  { mes: "Abr", receita: 29800, despesa: 13100 },
  { mes: "Mai", receita: 34500, despesa: 15200 },
  { mes: "Jun", receita: 41200, despesa: 17800 },
  { mes: "Jul", receita: 52600, despesa: 21400 },
  { mes: "Ago", receita: 61300, despesa: 24900 },
];

export const transacoes = [
  { id: "f1", descricao: "Romaria da Senhora da Agonia", espetaculo: "esp-1046", tipo: "Receita", categoria: "Cachet", data: "19 Jul 2026", valor: 8300, estado: "Recebido" },
  { id: "f2", descricao: "Cachets músicos — Julho", espetaculo: "esp-1046", tipo: "Despesa", categoria: "Pessoal", data: "31 Jul 2026", valor: 4620, estado: "Pago" },
  { id: "f3", descricao: "Combustível e portagens", espetaculo: "esp-1046", tipo: "Despesa", categoria: "Logística", data: "20 Jul 2026", valor: 486, estado: "Pago" },
  { id: "f4", descricao: "Festas de São Pedro (sinal)", espetaculo: "esp-1041", tipo: "Receita", categoria: "Cachet", data: "01 Ago 2026", valor: 1950, estado: "Recebido" },
  { id: "f5", descricao: "Reparação in-ear Shure", espetaculo: "", tipo: "Despesa", categoria: "Equipamento", data: "22 Jul 2026", valor: 340, estado: "Pendente" },
  { id: "f6", descricao: "Gala de Verão (sinal)", espetaculo: "esp-1045", tipo: "Receita", categoria: "Cachet", data: "05 Ago 2026", valor: 1470, estado: "Pendente" },
];

/* ---------------------------------------------------------- */
/* SINAIS OPERACIONAIS                                         */
/* ---------------------------------------------------------- */

export const notificacoes = [
  { id: "n1", tipo: "risco", texto: "Licença de ruído das Festas de São Pedro continua por receber", quando: "há 20 min", alvo: "/espetaculos/esp-1041" },
  { id: "n2", tipo: "contrato", texto: "Contrato da Noite Branca pendente há 11 dias", quando: "há 2 h", alvo: "/espetaculos/esp-1044" },
  { id: "n3", tipo: "equipa", texto: "Hugo Sá ainda não confirmou presença em Aveiro", quando: "há 3 h", alvo: "/espetaculos/esp-1041" },
  { id: "n4", tipo: "equipamento", texto: "In-ear Shure PSM300 marcado como avariado", quando: "há 5 h", alvo: "/equipamentos/eq-05" },
  { id: "n5", tipo: "financeiro", texto: "Sinal da Gala de Verão recebido — 1 470 €", quando: "ontem", alvo: "/financeiro" },
];

export const atividade = [
  { id: "a1", autor: "Marta Nogueira", acao: "assinou o contrato de", alvo: "Casamento Silva & Costa", quando: "há 12 min" },
  { id: "a2", autor: "Rui Marques", acao: "adicionou 3 músicas ao setlist de", alvo: "Festas de São Pedro", quando: "há 1 h" },
  { id: "a3", autor: "Sistema", acao: "marcou como avariado", alvo: "In-ear Shure PSM300", quando: "há 4 h" },
  { id: "a4", autor: "Tiago Ferraz", acao: "criou a proposta", alvo: "Noite Branca", quando: "ontem" },
  { id: "a5", autor: "Inês Cardoso", acao: "atualizou a disponibilidade em", alvo: "Agosto 2026", quando: "ontem" },
];

export const tarefas = [
  { id: "t1", titulo: "Enviar contrato — Feira Franca", prazo: "Hoje", prioridade: "Alta", feito: false, espetaculo: "esp-1043" },
  { id: "t2", titulo: "Confirmar rider técnico com Ovar", prazo: "Amanhã", prioridade: "Alta", feito: false, espetaculo: "esp-1043" },
  { id: "t3", titulo: "Pagar cachets de Julho", prazo: "3 Ago", prioridade: "Média", feito: false, espetaculo: "" },
  { id: "t4", titulo: "Reservar alojamento — Braga", prazo: "6 Ago", prioridade: "Média", feito: true, espetaculo: "esp-1044" },
  { id: "t5", titulo: "Rever setlist Gala de Verão", prazo: "12 Ago", prioridade: "Baixa", feito: false, espetaculo: "esp-1045" },
];

/* ---------------------------------------------------------- */
/* ENCORE AI                                                   */
/* ---------------------------------------------------------- */

export const aiSkills = [
  { id: "ai-1", nome: "Sugestão de setlist", desc: "Gera um alinhamento por blocos a partir do tipo de evento, público e histórico de pista.", icone: "ListMusic", exemplo: "Setlist para arraial no Norte, 4h, público 30-65" },
  { id: "ai-2", nome: "Análise de público", desc: "Cruza localidade, tipo de evento e histórico para prever faixa etária e temas com maior reação.", icone: "Users2", exemplo: "Que público esperar em Ovar a 21 Ago?" },
  { id: "ai-3", nome: "Sugestão de repertório", desc: "Identifica lacunas no repertório face às tendências e pedidos recentes.", icone: "Sparkles", exemplo: "O que nos falta para casamentos em 2026?" },
  { id: "ai-4", nome: "Análise meteorológica", desc: "Avalia risco de chuva e vento e propõe plano B de montagem.", icone: "CloudRain", exemplo: "Risco meteorológico da Feira Franca" },
  { id: "ai-5", nome: "Sugestão de logística", desc: "Calcula hora de saída, boleias, cargas por carrinha e paragens.", icone: "Truck", exemplo: "Otimizar transporte para Braga com 11 pessoas" },
  { id: "ai-6", nome: "Resumo de reuniões", desc: "Transforma notas ou áudio de reunião em decisões e tarefas atribuídas.", icone: "FileAudio", exemplo: "Resumir reunião de produção de ontem" },
  { id: "ai-7", nome: "Checklists automáticas", desc: "Cria checklists por área ajustadas ao tipo de palco e equipa.", icone: "ListChecks", exemplo: "Checklist para palco de rua com gerador" },
  { id: "ai-8", nome: "Cronogramas automáticos", desc: "Gera a timeline operacional a partir da hora de espetáculo e distância.", icone: "Clock", exemplo: "Timeline para show às 22h30 a 78 km" },
  { id: "ai-9", nome: "Assistente de produção", desc: "Responde a perguntas operacionais sobre qualquer espetáculo em curso.", icone: "Bot", exemplo: "Quem falta confirmar em Aveiro?" },
];

/* ---------------------------------------------------------- */
/* ROADMAP                                                     */
/* ---------------------------------------------------------- */

export const roadmap = {
  colunas: [
    { id: "backlog", titulo: "Backlog", cards: [
      { id: "r1", titulo: "Portal do cliente (aprovar setlist e timeline)", versao: "v1.5", prioridade: "Média" },
      { id: "r2", titulo: "Multi-organização com permissões por papel", versao: "v1.5", prioridade: "Alta" },
    ]},
    { id: "planeado", titulo: "Planeado", cards: [
      { id: "r3", titulo: "App móvel do músico (timeline + confirmações)", versao: "v1.4", prioridade: "Alta" },
      { id: "r4", titulo: "Assinatura digital de contratos", versao: "v1.3", prioridade: "Alta" },
      { id: "r5", titulo: "Faturação e recibos verdes automáticos", versao: "v1.3", prioridade: "Média" },
    ]},
    { id: "curso", titulo: "Em curso", cards: [
      { id: "r6", titulo: "Encore AI — assistente de produção", versao: "v1.2", prioridade: "Alta" },
      { id: "r7", titulo: "Live Mode em palco", versao: "v1.2", prioridade: "Alta" },
    ]},
    { id: "feito", titulo: "Concluído", cards: [
      { id: "r8", titulo: "Espetáculo como entidade central", versao: "v1.1", prioridade: "Alta" },
      { id: "r9", titulo: "Timeline operacional e checklists atribuíveis", versao: "v1.1", prioridade: "Alta" },
      { id: "r10", titulo: "Repertório com stems, partituras e domínio", versao: "v1.1", prioridade: "Alta" },
    ]},
  ],
};
