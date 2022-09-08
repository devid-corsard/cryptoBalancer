export default class Trade {
  constructor(trade = []) {
    if (Array.isArray(trade)) {
      [
        this.name = '',
        this.amount = '',
        this.buy = '',
        this.sell = '',
        this.fee = 0.01,
        this.singlefee = false,
        this.id = 0,
      ] = trade;
    } else {
      ({
        name: this.name = '',
        amount: this.amount = '',
        buy: this.buy = '',
        sell: this.sell = '',
        fee: this.fee = 0.01,
        singlefee: this.singlefee = false,
      } = trade);
    }
  }

  get spent() {
    return this.amount * this.buy;
  }

  get recieved() {
    const feeCorrection =
      (1 - (this.fee || 0.01) / 10) ** (this.singlefee ? 1 : 2);
    return this.amount * this.sell * feeCorrection;
  }

  get diff() {
    if (!this.spent || !this.recieved) return '';
    return this.recieved - this.spent;
  }

  toArray() {
    return [
      this.name,
      this.amount,
      this.buy,
      this.sell,
      this.fee,
      this.singlefee,
    ];
  }
}
