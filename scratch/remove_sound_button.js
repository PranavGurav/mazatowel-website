const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'react', 'src', 'admin.jsx');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Remove audio button from topbar
const audioBtnRegex = /\s*<button\s+type="button"\s+className=\{`topbar-btn topbar-audio-btn\s*[\s\S]*?<\/button>/;
if (!audioBtnRegex.test(content)) {
  console.error('Could not find audio button in topbar!');
  process.exit(1);
}
content = content.replace(audioBtnRegex, '');

// 2. Remove audioEnabled state and simplify enquiry count effect
const stateAndEffectRegex = /\s*const \[audioEnabled, setAudioEnabled\] = useState\([\s\S]*?\);\s*const prevEnquiriesCountRef = useRef\(null\);[\s\S]*?prevEnquiriesCountRef\.current = currentCount;\s*\}, \[data\?\.enquiries, audioEnabled\]\);/;

if (!stateAndEffectRegex.test(content)) {
  console.error('Could not find audioEnabled state/effect block!');
  process.exit(1);
}

const replacementState = `
  const prevEnquiriesCountRef = useRef(null);

  useEffect(() => {
    if (!data?.enquiries) return;
    const currentCount = data.enquiries.length;
    if (prevEnquiriesCountRef.current !== null && currentCount > prevEnquiriesCountRef.current) {
      const latestOrder = data.enquiries[0];
      setNotice({
        text: \`🔔 New order enquiry received from \${latestOrder?.customerName || 'customer'}!\`,
        undoAction: null
      });
    }
    prevEnquiriesCountRef.current = currentCount;
  }, [data?.enquiries]);`;

content = content.replace(stateAndEffectRegex, replacementState);

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Successfully removed sound on/off button and state from admin.jsx');

