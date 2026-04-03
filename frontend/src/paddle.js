import { initializePaddle } from '@paddle/paddle-js'

let _paddle = null

export async function getPaddle() {
  if (_paddle) return _paddle
  _paddle = await initializePaddle({
    environment: 'production',
    token: 'live_2af860b645fca6f106c9d79f8d2',
  })
  return _paddle
}

export const PRICES = {
  solo_monthly:    'pri_01kn91162qwft3tmwkenv19meq',
  growth_monthly:  'pri_01kn91k73gfeet8frv28stk8cz',
  agency_monthly:  'pri_01kn91n08h62e9hp29zm548qsw',
  solo_annual:     'pri_01kn926r754n8h11zm9p25svd8',
  growth_annual:   'pri_01kn9297gcehrm86engxwp1r0h',
  agency_annual:   'pri_01kn92b8fcnsb70t5bc0cf5hdq',
  lifetime_solo:   'pri_01kn92xhxt481fzpk3n1xgark7',
  lifetime_growth: 'pri_01kn9300a6hwsgh1nean24959z',
  lifetime_agency: 'pri_01kn9325rcaxcnk5s949nz3smh',
  founder_solo:    'pri_01kn95zq1axgmvgsczmx5zqqer',
  founder_growth:  'pri_01kn9624a48c9y2sjnbj8g36f2',
  founder_agency:  'pri_01kn965gbdb7vwfw3fx3pfqv45',
  pack_quick:      'pri_01kn96mpe190we3mx5bjycn3mj',
  pack_power:      'pri_01kn96ppcz3jvd1n07f97ndbh8',
  pack_arsenal:    'pri_01kn96r93fxz2chsfrzyezazqr',
}

/**
 * Open Paddle checkout overlay.
 * @param {string} priceKey  — key from PRICES map
 * @param {object} user      — { email, channel_id }
 */
export async function openCheckout(priceKey, user = {}) {
  const paddle = await getPaddle()
  paddle.Checkout.open({
    items: [{ priceId: PRICES[priceKey], quantity: 1 }],
    customer: user.email ? { email: user.email } : undefined,
    customData: {
      channel_id: user.channel_id || '',
      email:      user.email || '',
    },
  })
}
