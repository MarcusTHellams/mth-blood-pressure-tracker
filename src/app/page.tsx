import { AddBPReading } from '@/features/bp-readings';

const Home = () => {
	return (
		<main className="container my-16 mx-auto px-5">
			<h1 className="text-center">Blood Pressure Tracker</h1>
			<AddBPReading />
		</main>
	);
};

export default Home;
