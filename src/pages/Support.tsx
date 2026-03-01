import { motion } from "motion/react";

export function Support() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="mb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">SUPPORT</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          Shipping, Returns & Care.
        </p>
      </header>

      <div className="space-y-16">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Shipping</h2>
          <div className="space-y-4 text-limestone leading-relaxed">
            <p><strong>Malta & Gozo:</strong> We offer complimentary standard shipping on all orders within the Maltese islands. Deliveries are typically made within 2-3 business days.</p>
            <p><strong>European Union:</strong> Shipping rates are calculated at checkout based on destination and weight. Please allow 5-7 business days for delivery.</p>
            <p><strong>International:</strong> We currently do not ship outside of the EU. Please contact us for special requests.</p>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Returns</h2>
          <div className="space-y-4 text-limestone leading-relaxed">
            <p>We accept returns of unused, unlit candles in their original packaging within 14 days of delivery.</p>
            <p>To initiate a return, please contact our support team at <a href="mailto:hello@dawlstudio.com" className="text-gold hover:underline">hello@dawlstudio.com</a> with your order number.</p>
            <p>Please note that return shipping costs are the responsibility of the customer unless the item arrived damaged or defective.</p>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">FAQ</h2>
          <div className="space-y-6 text-limestone leading-relaxed">
            <div>
              <h3 className="text-offwhite font-display text-sm tracking-widest uppercase mb-2">Are your candles vegan?</h3>
              <p>Yes, our proprietary wax blend is 100% vegan and cruelty-free.</p>
            </div>
            <div>
              <h3 className="text-offwhite font-display text-sm tracking-widest uppercase mb-2">Can I repurpose the vessel?</h3>
              <p>Absolutely. Once the candle has burned down, clean the vessel with warm soapy water. It can be used as a planter, a pen holder, or a decorative object.</p>
            </div>
            <div>
              <h3 className="text-offwhite font-display text-sm tracking-widest uppercase mb-2">Do you offer wholesale?</h3>
              <p>Yes, we partner with select boutiques and luxury hotels. Please reach out via our <a href="/contact" className="text-gold hover:underline">Contact page</a>.</p>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Candle Care & Safety</h2>
          <div className="space-y-4 text-limestone leading-relaxed">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>The First Burn:</strong> Allow the wax to melt completely to the edges of the vessel during the first burn to prevent tunneling. This usually takes 2-3 hours.</li>
              <li><strong>Wick Trimming:</strong> Always trim the wick to 5mm before each lighting to ensure a clean, even burn and prevent smoking.</li>
              <li><strong>Burn Time:</strong> Do not burn the candle for more than 4 hours at a time.</li>
              <li><strong>Safety First:</strong> Never leave a burning candle unattended. Keep away from drafts, children, pets, and flammable materials.</li>
              <li><strong>Extinguishing:</strong> Use a snuffer to extinguish the flame. If you have the Premium Edition, the matte gold lid can be used to safely extinguish the candle.</li>
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
