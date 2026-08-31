import type { Locale } from "@/lib/i18n/config";

// Display-only place-name localisation (owner 2026-07-28). Data keys, slugs and
// URLs are UNCHANGED; this maps the block/cluster names that appear in the data
// to the reviewed display names: English fixes 3 block spellings, Odia adds all.
// Keyed by the name as it appears in src/data (district.json / cluster-index / *.json).

const BLOCK: Record<string, { en: string; od: string }> = {
  "Anugola": {
    "en": "Anugola",
    "od": "ଅନୁଗୋଳ"
  },
  "Athamalik": {
    "en": "Athamallik",
    "od": "ଆଠମଲ୍ଲିକ"
  },
  "Banarpal": {
    "en": "Banarpal",
    "od": "ବଅଁରପାଳ"
  },
  "Chhendipada": {
    "en": "Chhendipada",
    "od": "ଛେଣ୍ଡିପଦା"
  },
  "Kaniha": {
    "en": "Kaniha",
    "od": "କଣିହାଁ"
  },
  "Kishore Nagar": {
    "en": "Kishorenagar",
    "od": "କିଶୋରନଗର"
  },
  "Palalahada": {
    "en": "Palalahada",
    "od": "ପାଲଲହଡା"
  },
  "Talachera": {
    "en": "Talacher",
    "od": "ତାଳଚେର"
  }
};

const CLUSTER_OD: Record<string, string> = {
  "Amalapada ps": "ଅମଲାପଡା ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Ambapal High school": "ଆମ୍ବପାଳ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Ambasarmunda": "ଆମ୍ବସରମୁଣ୍ଡା",
  "Antulia": "ଅନ୍ତୁଳିଆ",
  "BADAJORADA NUPS": "ବଡଯୋରଡ଼ା ଏନ୍‌ୟୁପିଏସ୍",
  "BADAKERA UPS": "ବଡ଼କେରା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "BALARAMPMRASAD HS": "ବଳରାମ ପ୍ରସାଦ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "BANTALA": "ବନ୍ତଳା",
  "BATISUAN": "ବତିସୁଆଁ",
  "BEDASASAN": "ବେଡାଶାସନ",
  "BINIKEYEE NHS,LUHASINGA": "ବିନିକେୟୀ ଲୁହାସିଙ୍ଗା",
  "Badagunduri": "ବଡଗୁଣ୍ଡୁରୀ",
  "Badakantakul": "ବଡ଼କନ୍ତକୁଳ",
  "Baghuabol Nups": "ବାଘୁଆବୋଲ  ନୋଡାଲ ଉଚ୍ଚପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Bahadapasi": "ବାହାଡାପଶି",
  "Bajrakote Nodal UPS": "ବଜ୍ରକୋଟ ନୋଡାଲ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Balipatta": "ବାଲିପଟ୍ଟା",
  "Barkotia ups": "ବାରକୋଟିଆ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Basantapur NUPS": "ବସନ୍ତପୁର ଏନ୍‌ୟୁପିଏସ୍",
  "Biharipur PUPS": "ବିହାରୀପୁର ପ୍ରକଳ୍ପ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Brajamohan nups": "ବ୍ରଜମୋହନ ଏନ୍‌ୟୁପିଏସ୍",
  "Brajanathpur UPS": "ବ୍ରଜନାଥପୁର ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "CHASAGURUJANG UPS": "ଚଷାଗୁରୁଜାଙ୍ଗ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Chhendipada HS": "ଛେଣ୍ଡିପଦା ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Chungamatia": "ଚୁଙ୍ଗମାଟିଆ",
  "Collegepada": "କଲେଜପଡା",
  "DERANG": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ  ଡେରଙ୍ଗ",
  "DEULABEDA COLLIERY MODEL NODAL HIGH SCHOOL": "ଦେଉଳବେଡା କୋଲିଆରୀ ମଡେଲ ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "DUMUDUMA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଦୁମୁଦୁମା",
  "DURGAPUR NUPS": "ଦୁର୍ଗାପୁର ଏନ୍‌ୟୁପିଏସ୍",
  "Fakir Charan UP School Tubey Cluster": "ଫକୀର ଚରଣ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ତୁବେ",
  "Fulapada ups": "ଫୁଲପଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "GADASILA UPS Kaniha": "ଗଦାଶିଳା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କଣିହାଁ",
  "GADATARAS": "ସରକାରୀ ଉନ୍ନୀତ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, ଗଡ଼ତରାସ",
  "GHODABANDHUNI UPS": "ଘୋଡାବାନ୍ଧୁଣି ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "GOTAMARA": "ଗୋତମରା",
  "GOVT PS INJIDI": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଇଞ୍ଜିଡ଼ି",
  "GOVT PS POIPAL": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ପୋଇପାଳ",
  "GOVT PS SAMAL": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ସମଲ",
  "GOVT UPS ARKIL": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଅର୍କିଲ",
  "GOVT UPS BAJAPUR": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ବାଜପୁର",
  "GOVT UPS BALIPASI": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ବାଲିପଶି",
  "GOVT UPS BRAHMANBIL": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ବ୍ରାହ୍ମଣବିଲି",
  "GOVT UPS DHAURAPALI": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଧଉରାପାଲି",
  "GOVT UPS GANDIBEDHA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଗଣ୍ଡିବେଢ଼",
  "GOVT UPS HANUMANPUR": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ହନୁମାନପୁର",
  "GOVT UPS JARADA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଜରଡ଼ା",
  "GOVT UPS JHARBEDA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଝାରବେଡ଼ା",
  "GOVT UPS KANTIAPASHI": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କଣ୍ଟିଆପଶି",
  "GOVT UPS KENDUNALI": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କେନ୍ଦୁନାଳୀ",
  "GOVT UPS RANIAKATA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ରଣିଆକଟା",
  "GOVT UPS TURANG": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ତୁରଙ୍ଗ",
  "GOVT UPS, HIMITIRA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ହିମିତିରା",
  "GOVT. NUPS MADHAPUR": "ସରକାରୀ ଏନ୍‌ୟୁପିଏସ୍ ମାଧପୁର",
  "GOVT.UGHS SEEGARH": "ସରକାରୀ ଉନ୍ନୀତ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, ଶିଗଡ",
  "Garhsantri Gov't UPS": "ଗଡ଼ସନ୍ତ୍ରୀ ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Ghantapada NHS": "ଘଣ୍ଟପଡ଼ା ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Gobara NHS": "ଗୋବରା ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Gopalprasad NHS": "ଗୋପାଳପ୍ରସାଦ ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Govt High school Badatribida": "ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ବଡତ୍ରିବିଡା",
  "Govt PS kaniha": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କଣିହାଁ",
  "Govt PS, Kanteikulia": "ସରକାରୀ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କଣ୍ଟେଇକୁଳିଆ",
  "Govt UGHS Bahalasahi": "ସରକାରୀ ଉନ୍ନୀତ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ  ବାହାଳସାହି",
  "Govt UPS JENAPADA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ,ଜେନ।ପଡ଼ା",
  "Govt UPS Jairat": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଜଏରାଟ",
  "Govt UPS PARANGA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ପରଙ୍ଗ",
  "Govt UPS Pabitranagar": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ପବିତ୍ରନଗର",
  "Govt UPS Sanjamura": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ସଞ୍ଜାମୁରା",
  "Govt ups Angapada Turuda": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଅଙ୍ଗପଡା ତୁରୁଡ଼ା",
  "Govt ups kunjam": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କୁଞ୍ଜାମ",
  "Govt. UPS SIBIDA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ସିବିଡ଼ା",
  "Govt.UPS Munduribeda": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ. ମୁଣ୍ଡୁରିବେଢ଼ା",
  "HARIHAR GOVT. HS KUKUDANG": "ହରିହର ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ କୁକୁଡାଙ୍ଗ",
  "HATIADANDA": "ହଟିଆଦାଣ୍ଡ",
  "HK Mahatab ups Iswaranagar": "ଏଚ୍ କେ ମହତାବ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଈଶ୍ବରନଗର",
  "Handapa PS": "ହଣ୍ଡପା ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "JAMUNDA UPS": "ଜାମୁଣ୍ଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "JGHS BILEINALI": "ଜେଜିଏଚ୍ଏସ୍ ବିଲେଇନାଳୀ",
  "Jagannath Govt HS Itee": "ଜଗନ୍ନାଥ ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ଇତି",
  "Jagannathpur": "ଜଗନ୍ନାଥପୁର",
  "Jereng Dehuri Sahi UGHS": "ଜେରଙ୍ଗ ଦେହୁରୀସାହି ଉନ୍ନୀତ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Jhatakipasi": "ଝାଟକିପସି",
  "KANDASAR": "କାଣ୍ଡସର କ୍ଲଷ୍ଟର",
  "KANDHAPADA NUPS": "କନ୍ଧପଡା ଏନ୍‌ୟୁପିଏସ୍",
  "KANTALA": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ, କନ୍ତଳା",
  "KHAMAR NUPS": "ଖମାର ଏନ୍‌ୟୁପିଏସ୍",
  "KHAMAR PS CLUSTER": "ଖମାର ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କ୍ଲଷ୍ଟର",
  "KISHOREGANJ": "କିଶୋରଗଞ୍ଜ",
  "KOSALA PS": "କୋଶଳା ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "KUTESWAR UPS": "କୁଟେଶ୍ୱର ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kadalimunda ups": "କଦଳୀମୁଣ୍ଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kalamachhuin UPS": "କଳମଛୁଇଁ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kalapat pups": "କଳାପାଟ ପ୍ରକଳ୍ପ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kanaloi ups": "କଣଲୋଇ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kankarei UPS": "କଙ୍କରେଇ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Khandabar PS": "ଖଣ୍ଡବର ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kiakata PS": "କିଆକଟା ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Kukurpeta": "କୁକୁରପେଟା",
  "Kumanda Jarasingha Cluster": "କୁମଣ୍ଡ ଜରାସିଂହା କ୍ଲଷ୍ଟର",
  "LNGHS, Sankhamur": "ଲକ୍ଷ୍ମୀ ନାରାୟଣ ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, ଶଙ୍ଖମୂର",
  "MACHHAKUTA UPS": "ମାଛକୁଟା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "MAHENDRA HIGH SCHOOL ATHAMALLIK": "ମହେନ୍ଦ୍ର ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ଆଠମଲ୍ଲିକ",
  "MAHIDHARPUR HS": "ମହୀଧରପୁର ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "MAIMURA PS": "ମଇମୁରା ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "MHS NAKCHI": "ଏମ୍ଏଚ୍ଏସ୍ ନାକଚି",
  "NILAKANTHAPADA UPS": "ନୀଳକଣ୍ଠପଡ଼ା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "NUAHATA CLUSTER": "ନୂଆହତା କ୍ଲଷ୍ଟର",
  "ODASINGA UPS": "ଓଡ଼ଶିଙ୍ଗା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "OGI UGHS": "ଓଗି ଉନ୍ନୀତ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "PABITRAMOHAN GOVT UPS URUKULA": "ପବିତ୍ରମୋହନ ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ଉରୁକୁଳା",
  "PEDI PATHAR": "ପେଡି ପଥର",
  "PNHS Kumurisingha": "ପଞ୍ଚାୟତ ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ କୁମୁରିସିଂହା",
  "PNHS,PADIABHANGA": "ପି ଏନ ଏଚ ଏସ ପଡିଆଭଙ୍ଗା",
  "Patakumunda NHS": "ପାଟକୁମୁଣ୍ଡା ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "Pokatunga": "ପୋକତୁଙ୍ଗା",
  "Purunagarh": "ପୁରୁଣାଗଡ଼",
  "Purunakote PS": "ପୁରୁଣାକୋଟ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "RADHAMADHAB GOVT. HIGH SCHOOL PAIKSAHI": "ରାଧାମାଧବ ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ପାଇକସାହି",
  "SASTRIJEE UPS, KRUTIBASPUR": "ଶାସ୍ତ୍ରୀଜୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ କୃତ୍ତିବାସପୁର",
  "SUSUBA": "ଶୁଶୁବା",
  "Sahargurujanga": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ସହର ଗୁରୁଜାଙ୍ଗ",
  "Saida": "ସଇଡା",
  "Sakosingha UPS": "ଶାକୋସିଂହା  ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Saradhapur": "ଶରଧାପୁର",
  "Sri Jagannath NHS": "ଶ୍ରୀ ଜଗନ୍ନାଥ ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "TALABEDA UPS": "ତାଳବେଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "TAPADHOL": "ଟାପଢୋଲ",
  "THAKURGARH PS": "ଠାକୁରଗଡ଼ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "TULASIPAL CLUSTER": "ତୁଲସିପାଳ କ୍ଲଷ୍ଟର",
  "Tainsi Cluster": "ଟାଇଁଶୀ କ୍ଲଷ୍ଟର",
  "Town Girls' UPS": "ଟାଉନ ବାଳିକା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Unknown": "ଉଂକ୍ନୋୱ୍ନ",
  "YJHS BAMUR": "ୱାଇଜେଏଚ୍ଏସ୍ ବାମୁର",
  "korada ups": "କୋରଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "BATISUAN UPS": "ବତିସୁଆଁ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Balipatta Nodal High School": "ବାଲିପଟ୍ଟା ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ",
  "GOVT NODAL HIGH SCHOOL GOTAMARA": "ସରକାରୀ ନୋଡାଲ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ଗୋତମରା",
  "Govt ups Badagunduri": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ, ବଡ ଗୁଣ୍ଡୁରୀ",
  "Govt ups Purunagarh": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ ପୁରୁଣାଗଡ",
  "Govt upsBadagunduri": "ସରକାରୀ ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ, ବଡ ଗୁଣ୍ଡୁରୀ",
  "Jhatakipasi PS": "ଝାଟକିପଶି ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Jhatakipasi ps": "ଝାଟକିପଶି ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "Korada ups": "କୋରଡା ଉଚ୍ଚ ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ",
  "YUVAJYOTI  GOVERNMENT HIGH SCHOOL,BAMUR": "ଯୁବଜ୍ୟୋତି ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ବାମୁର",
  "YUVAJYOTI GOVERNMENT HIGH SCHOOL BAMUR": "ଯୁବଜ୍ୟୋତି ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ବାମୁର",
  "YUVAJYOTI GOVERNMENT HIGH SCHOOL,BAMUR": "ଯୁବଜ୍ୟୋତି ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ ବାମୁର",
};

/** Localised block display name; falls back to the raw name (e.g. "District"). */
export function blockName(name: string, locale: Locale): string {
  const b = BLOCK[name];
  return b ? (locale === "od" ? b.od : b.en) : name;
}

/** Localised cluster display name; English clusters are unchanged, Odia from the review. */
export function clusterName(name: string, locale: Locale): string {
  return locale === "od" ? (CLUSTER_OD[name] || name) : name;
}
