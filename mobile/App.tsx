
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  const [imagem, setImagem] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modeloCarregado, setModeloCarregado] = useState(false);

  const detectorRef = useRef<any>(null);

  async function selecionarImagem() {
    setErro(null);
    setResultado(null);

    const selecao = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!selecao.canceled && selecao.assets.length > 0) {
      setImagem(selecao.assets[0].uri);
    }
  }

  async function carregarDetector() {
    if (detectorRef.current) {
      return detectorRef.current;
    }

    const biblioteca = (window as any).MediaPipeVision
  ? (window as any).MediaPipeVision
  : await new Promise<any>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/mediapipe-loader.js';

      script.onload = () => {
        const api = (window as any).MediaPipeVision;

        if (api) {
          resolve(api);
        } else {
          reject(new Error('A biblioteca MediaPipe não foi carregada.'));
        }
      };

      script.onerror = () => {
        reject(new Error('Não foi possível carregar mediapipe-loader.js.'));
      };

      document.head.appendChild(script);
    });

const { FilesetResolver, HandLandmarker } = biblioteca;

    const arquivosWasm = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
    );

    const detector = await HandLandmarker.createFromOptions(
      arquivosWasm,
      {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
        },
        runningMode: 'IMAGE',
        numHands: 1,
      }
    );

    detectorRef.current = detector;
    setModeloCarregado(true);

    return detector;
  }

  function classificarGesto(pontos: any[]): string {
    // Distância entre a ponta e o pulso, dividida pela
    // distância entre a articulação escolhida e o pulso.
    const distancia = (a: any, b: any) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const dedos = [
      { nome: 'polegar', ponta: 4, articulacao: 3 },
      { nome: 'indicador', ponta: 8, articulacao: 6 },
      { nome: 'medio', ponta: 12, articulacao: 10 },
      { nome: 'anelar', ponta: 16, articulacao: 14 },
      { nome: 'mindinho', ponta: 20, articulacao: 18 },
    ];

    const pulso = pontos[0];

    const razoes = dedos.map((dedo) => {
      const denominador = distancia(
        pontos[dedo.articulacao],
        pulso
      );

      if (denominador === 0) {
        return 0;
      }

      return distancia(pontos[dedo.ponta], pulso) / denominador;
    });

    const polegar = razoes[0];
    const outrosDedos = razoes.slice(1);

    if (outrosDedos.every((valor) => valor > 1.15)) {
      return '✋ Mão aberta';
    }

    const dedosRecolhidos = outrosDedos.filter(
      (valor) => valor < 0.95
    ).length;

    const polegarLevantado =
      pontos[4].y < pontos[3].y &&
      pontos[4].y < pontos[2].y;

    if (
      polegar > 1.05 &&
      dedosRecolhidos >= 3 &&
      polegarLevantado
    ) {
      return '👍 Positivo';
    }

    if (dedosRecolhidos >= 3) {
      return '✊ Punho fechado';
    }

    return 'Gesto não identificado com segurança';
  }

  async function analisarImagem() {
    if (!imagem) {
      setErro('Selecione uma imagem primeiro.');
      return;
    }

    if (Platform.OS !== 'web') {
      setErro(
        'Esta versão do detector foi preparada para o navegador.'
      );
      return;
    }

    setAnalisando(true);
    setErro(null);
    setResultado(null);

    let imagemTemporaria: HTMLImageElement | null = null;

    try {
      const detector = await carregarDetector();

      imagemTemporaria = document.createElement('img');
      imagemTemporaria.src = imagem;

      await new Promise<void>((resolve, reject) => {
        if (imagemTemporaria!.complete && imagemTemporaria!.naturalWidth > 0) {
          resolve();
          return;
        }

        imagemTemporaria!.onload = () => resolve();
        imagemTemporaria!.onerror = () =>
          reject(new Error('Não foi possível abrir a imagem selecionada.'));
      });

      const deteccao = detector.detect(imagemTemporaria);

      if (!deteccao.landmarks || deteccao.landmarks.length === 0) {
        setResultado('Nenhuma mão detectada');
        return;
      }

      const pontos = deteccao.landmarks[0];
      const gesto = classificarGesto(pontos);

      setResultado(gesto);
    } catch (erroDesconhecido) {
      console.error(erroDesconhecido);

      setErro(
        'Não foi possível executar o MediaPipe. Confira a conexão com a internet e o carregamento do modelo. Veja também o console do navegador para detalhes.'
      );
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.selo}>MICROPROJETO • VISÃO COMPUTACIONAL</Text>
      <Text style={styles.titulo}>Gestos em foco</Text>
      <Text style={styles.subtitulo}>
        Reconhecimento de gestos manuais com MediaPipe
      </Text>

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>Escolha uma imagem</Text>
        <Text style={styles.descricao}>
          Selecione uma foto que mostre uma mão para o detector analisar.
        </Text>

        <Pressable
          style={styles.botaoSecundario}
          onPress={selecionarImagem}
        >
          <Text style={styles.textoBotaoSecundario}>
            {imagem ? 'Escolher outra imagem' : 'Selecionar imagem'}
          </Text>
        </Pressable>

        {imagem ? (
          <Image
            source={{ uri: imagem }}
            style={styles.imagem}
            resizeMode="contain"
            accessibilityLabel="Imagem selecionada para análise"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.emoji}>✋</Text>
            <Text style={styles.placeholderTexto}>
              Sua imagem aparecerá aqui
            </Text>
          </View>
        )}

        <Pressable
          style={[
            styles.botaoPrincipal,
            (!imagem || analisando) && styles.botaoDesativado,
          ]}
          onPress={analisarImagem}
          disabled={!imagem || analisando}
        >
          {analisando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotaoPrincipal}>
              Analisar gesto
            </Text>
          )}
        </Pressable>

        {modeloCarregado && (
          <Text style={styles.statusModelo}>
            Detector MediaPipe carregado
          </Text>
        )}

        {erro ? (
          <View style={styles.aviso}>
            <Text style={styles.textoAviso}>{erro}</Text>
          </View>
        ) : null}

        {resultado ? (
          <View style={styles.resultado}>
            <Text style={styles.rotuloResultado}>
              RESULTADO DA ANÁLISE
            </Text>
            <Text style={styles.textoResultado}>{resultado}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.rodape}>
        Protótipo acadêmico. O detector identifica pontos da mão; as
        regras geométricas classificam os gestos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  selo: {
    color: '#5365A8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  titulo: {
    color: '#192343',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitulo: {
    color: '#667085',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
  },
  cartao: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E9F4',
  },
  tituloSecao: {
    color: '#192343',
    fontSize: 20,
    fontWeight: '700',
  },
  descricao: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#5365A8',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#45589C',
    fontSize: 15,
    fontWeight: '700',
  },
  imagem: {
    width: '100%',
    height: 260,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#F4F6FB',
  },
  placeholder: {
    height: 220,
    backgroundColor: '#F4F6FB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  emoji: {
    fontSize: 58,
  },
  placeholderTexto: {
    color: '#667085',
    fontSize: 14,
    marginTop: 12,
  },
  botaoPrincipal: {
    backgroundColor: '#45589C',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoDesativado: {
    opacity: 0.45,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusModelo: {
    color: '#287548',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  aviso: {
    backgroundColor: '#FFF4E5',
    borderRadius: 10,
    padding: 13,
    marginTop: 16,
  },
  textoAviso: {
    color: '#8A4B08',
    fontSize: 13,
    lineHeight: 19,
  },
  resultado: {
    backgroundColor: '#E8F7EE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  rotuloResultado: {
    color: '#287548',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  textoResultado: {
    color: '#195B35',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  rodape: {
    maxWidth: 460,
    color: '#7A8298',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 16,
  },
});
