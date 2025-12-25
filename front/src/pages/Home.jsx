import Nav from '../components/Nav.jsx';


const features = [
  { title: "Timetables", desc: "Generate and view schedules" },
  { title: "Teachers", desc: "Manage teachers and preferences" },
  { title: "Subjects", desc: "Configure courses and hours" },
  { title: "Rooms", desc: "Define room capacities" },
  { title: "Groups", desc: "Organize student groups" },
  { title: "AI Assistant", desc: "Search and analyze data in ease" },
];

function Home() {
  return (
    <div className='bg-slate-50'>
      {/* Navigation Bar */}
      <Nav />

      <main className="min-h-screen p-8 ">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-slate-900 font-bold">
            University Timetable Generator
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-8">
            Automated scheduling system with heuristic optimization. <br />
            Preference-based placement
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto  items-center">
          {features.map((item, index) => (
            <FeatureCard key={index} title={item.title} desc={item.desc} />
          ))}
        </div>
      </main>
    </div>
  );
}


function FeatureCard({ title, desc }) {
  return (
    <div className="p-6 bg-white border border-gray-200  rounded-xl shadow-sm hover:shadow-md transition-shadow "> 
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}

export default Home;