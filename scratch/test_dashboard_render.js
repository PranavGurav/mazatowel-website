const http = require('http');

async function test() {
  const loginRes = await new Promise((res, rej) => {
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (r) => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res({ cookie: r.headers['set-cookie'] }));
    });
    req.write(JSON.stringify({ email: 'admin@mazatowel.in', password: 'MazaTowel123!' }));
    req.end();
  });

  const cookie = loginRes.cookie[0].split(';')[0];
  const data = await new Promise((res, rej) => {
    http.get({ hostname: 'localhost', port: 3000, path: '/api/admin-data', headers: { Cookie: cookie } }, (r) => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res(JSON.parse(b)));
    });
  });

  console.log('Keys in data:', Object.keys(data));

  // Now simulate all logic inside Dashboard:
  try {
    const products = data.products || [];
    const designs = data.designs || [];
    const reviews = data.reviews || [];
    const enquiries = data.enquiries || [];
    const stats = data.stats || {};
    const colors = data.colors || [];
    const visitors = data.visitors || {};
    const vSummary = visitors?.summary || {};

    const realtime = visitors?.realtime || {
      activeNow: 0,
      sections: {},
      devices: { Mobile: 0, Desktop: 0 },
      recentActivity: []
    };

    const todayVisitors = Number(vSummary.today ?? 0);
    const weekVisitors = Number(vSummary.thisWeek ?? 0);
    const monthVisitors = Number(vSummary.thisMonth ?? 0);
    const totalVisitors = Number(vSummary.total ?? 0);
    const activeNow = Number(realtime?.activeNow ?? 0);

    const isTShirtItem = (item) => {
      if (!item) return false;
      if (item.category === 'Custom T-Shirts') return true;
      if (item.placement) return true;
      const prod = String(item.product || item.name || '').toLowerCase();
      return prod.includes('t-shirt') || prod.includes('tshirt') || prod.includes('polo') || prod.includes('tee');
    };

    const newEnquiries = enquiries.filter(e => !e.status || e.status === 'New');
    const contacted = enquiries.filter(e => e.status === 'Contacted');
    const inProduction = enquiries.filter(e => e.status === 'In Production');
    const shipped = enquiries.filter(e => e.status === 'Shipped');
    const closed = enquiries.filter(e => e.status === 'Closed');
    const completed = enquiries.filter(e => e.status === 'Shipped' || e.status === 'Closed');

    const avgRating = reviews.length
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '0.0';

    const inStockColors = colors.filter(c => c.inStock !== false);

    const totalEnquiriesCount = enquiries.length;
    const fulfillmentRate = totalEnquiriesCount > 0 ? Math.round((completed.length / totalEnquiriesCount) * 100) : 0;
    const apparelCount = enquiries.filter(e => isTShirtItem(e)).length;
    const towelsCount = totalEnquiriesCount - apparelCount;

    const pipelineStages = [
      { key: 'New', label: 'New / Action Needed', color: '#B42318', count: newEnquiries.length },
      { key: 'Contacted', label: 'Contacted', color: '#2F7F82', count: contacted.length },
      { key: 'In Production', label: 'In Production', color: '#D5A45A', count: inProduction.length },
      { key: 'Shipped', label: 'Shipped / Fulfilled', color: '#24996B', count: shipped.length },
      { key: 'Closed', label: 'Completed / Closed', color: '#69777B', count: closed.length },
    ];

    const donutRadius = 48;
    const donutCircumference = 2 * Math.PI * donutRadius;
    let donutAccumulatedPercent = 0;
    const donutSegments = pipelineStages.map(stage => {
      const fraction = totalEnquiriesCount > 0 ? stage.count / totalEnquiriesCount : 0;
      const strokeDasharray = `${fraction * donutCircumference} ${donutCircumference}`;
      const strokeDashoffset = -donutAccumulatedPercent * donutCircumference;
      donutAccumulatedPercent += fraction;
      return { ...stage, fraction, strokeDasharray, strokeDashoffset, percent: Math.round(fraction * 100) };
    });

    console.log('Fulfillment rate:', fulfillmentRate);
    console.log('Donut segments computed successfully:', donutSegments.length);

    // Workshop health
    const totalColors = colors.length || 1;
    const inStockCols = inStockColors.length;
    const colorsPct = Math.round((inStockCols / totalColors) * 100);

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const val = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      ratingCounts[val] = (ratingCounts[val] || 0) + 1;
    });

    const totalReviews = reviews.length || 1;
    const starHistogram = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingCounts[stars] || 0,
      percent: Math.round(((ratingCounts[stars] || 0) / totalReviews) * 100)
    }));

    console.log('Workshop health colorsPct:', colorsPct);
    console.log('Star histogram length:', starHistogram.length);

    // Telemetry
    const mobileCount = Number(realtime?.devices?.Mobile ?? 0);
    const desktopCount = Number(realtime?.devices?.Desktop ?? 0);
    const totalDevices = mobileCount + desktopCount;
    const mobilePct = totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 50;
    const desktopPct = totalDevices > 0 ? 100 - mobilePct : 50;

    console.log('Mobile/Desktop pct:', mobilePct, desktopPct);
    console.log('ALL COMPUTATIONS PASSED WITHOUT ERROR!');
  } catch (err) {
    console.error('ERROR in Dashboard logic:', err);
  }
}

test();
