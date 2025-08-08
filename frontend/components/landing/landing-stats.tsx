const stats = [
  { value: '95%', label: 'Patient Engagement Rate' },
  { value: '60%', label: 'Time Saved on Admin Tasks' },
  { value: '40%', label: 'Increase in Appointment Bookings' },
  { value: '24/7', label: 'Automated Campaign Monitoring' }
]

export function LandingStats() {
  return (
    <div className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proven Results
          </h2>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Join hundreds of healthcare practices already transforming their patient engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-teal-100 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
