import { AddBPReading, BPChart } from '@/features/bp-readings';

const Home = () => {
	return (
		<main className="container my-16 mx-auto px-5">
			<h1 className="text-center">Blood Pressure Tracker</h1>
			<div className="text-center">
				<AddBPReading />
			</div>
			<div className="my-8">
				<BPChart />
			</div>
		</main>
	);
};

export default Home;
