import { NextPage } from 'next';
import Link from 'next/link';
import { useQuery, withWunderGraph, useMutation } from '../components/generated/nextjs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
	const movies = useQuery({
		operationName: 'Movies',
	});
	const { data, trigger: deleteTrigger } = useMutation({
		operationName: "movies/Delete"
	});
	const refresh = () => {
		movies.mutate();
	};
	const router = useRouter();
	const handleDelete = async (id: string) => {
		const res = await deleteTrigger({
			id: { id }
		});

		refresh();
	}
	const handleExport = () => {
		if (movies && movies.data) {
			const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
				JSON.stringify(movies.data.mongodb_findManymovies)
			)}`;
			const link = document.createElement("a");
			link.href = jsonString;
			link.download = "movies.json";
			link.click();
		}
	}
	const handleWatch = (fileName: string) => {
		router.push(`./movies/watch/${fileName}`);
	}
	const handleEdit = async (id: any) => {
		router.push(`./movies/edit/${id}`);
	}
	return (
		<div>
			<div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
				<div className="flex justify-center">
					<div className="w-40 text-cyan-400 dark:text-white">

					</div>
				</div>
				<h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center">
					Movie List
				</h1>
			</div>
			<div className="flex justify-center mt-8">
				<Link href="./movies/add"><Button sx={{ margin: "10px" }} >New Movie</Button></Link>
				<Button onClick={handleExport} color="primary" variant='outlined'>Export</Button>
			</div>
			<div className="relative flex flex-col items-center p-8 sm:p-12">
				<div className="mx-auto flex max-w-sm flex-col items-center">
					<code className="p-3" data-testid="result">
						{movies && movies.data && movies.data.mongodb_findManymovies ?
							<TableContainer component={Paper} elevation={10}>
								<Table sx={{ minWidth: 650 }} aria-label="simple table">
									<TableHead>
										<TableRow>
											<TableCell>Movie Title</TableCell>
											<TableCell align="right">Country</TableCell>
											{/* <TableCell align="right">Release Date</TableCell> */}
											<TableCell align="right">Rating</TableCell>
											<TableCell align="right">Duration</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{movies.data.mongodb_findManymovies.map((movie, index) => (
											<TableRow
												key={index}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell component="th" scope="row">
													{movie.title}
												</TableCell>
												<TableCell align="right">{movie.origin_country}</TableCell>
												{/* <TableCell align="right">{movie.release_date}</TableCell> */}
												<TableCell align="right">{movie.rating}</TableCell>
												<TableCell align="right">{movie.duration}</TableCell>
												<TableCell align="center"><Button onClick={() => handleWatch(movie.fileName)} color='success' variant='outlined'>Watch</Button></TableCell>
												<TableCell align="center"><Button onClick={() => handleEdit(movie.id)} variant='outlined'>Edit</Button></TableCell>
												<TableCell align="center"><Button onClick={() => handleDelete(movie.id)} color='error' variant='outlined'>Delete</Button></TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
							: "No Movies Added"}
					</code>
				</div>
			</div>
		</div>
	);
};

export default withWunderGraph(Home);
