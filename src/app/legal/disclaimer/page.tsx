
export default function DisclaimerPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
              Legal Disclaimer and Assumption of Risk
            </h1>
          </header>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary">Inherent Risks</h2>
              <p>
                I acknowledge that participating in activities at Green’s Green
                Retreat, such as walking on uneven terrain, interacting with
                domestic and wild animals, and using retreat facilities, involves
                inherent risks. These risks include, but are not limited to,
                falls, injuries from animals, and other unforeseen accidents.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary">Assumption of Risk</h2>
              <p>
                I voluntarily assume all risks, known and unknown, associated
                with my stay and participation in any activities at Green’s
                Green Retreat. I understand that these risks may result in
                personal injury, property damage, or other losses.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary">Release of Liability</h2>
              <p>
                In consideration for being permitted to stay at Green’s Green
                Retreat, I, for myself and on behalf of my heirs, assigns,
                personal representatives, and next of kin, hereby release and
                hold harmless Green’s Green Retreat, its owners, employees, and
                affiliates from any and all claims, liabilities, and causes of
                action arising out of or related to any loss, damage, or injury,
                including death, that may be sustained by me or my property
                while at the retreat.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary">Indemnification</h2>
              <p>
                I agree to indemnify and hold harmless Green’s Green Retreat
                from any loss, liability, damage, or costs, including court
                costs and attorneys' fees, that may arise from my presence at
                the retreat or my participation in its activities.
              </p>
            </section>
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary">Governing Law</h2>
              <p>
                This agreement shall be governed by and construed in accordance
                with the laws of Kenya. Any legal action or proceeding arising
                under this agreement will be brought exclusively in the courts
                located in Kenya.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
