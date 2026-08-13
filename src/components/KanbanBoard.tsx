import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Celebration } from "#/components/Celebration";
import { CreateItemDialog } from "#/components/CreateItemDialog";
import { KanbanColumn } from "#/components/KanbanColumn";
import { charactersQueryKey, fetchCharacters } from "#/lib/characters";
import { COLUMNS } from "#/lib/columns";
import type { Point } from "#/lib/types";
import logo from "#/logo.svg";
import { useKanbanStore } from "#/stores/kanban";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function KanbanBoard() {
	const items = useKanbanStore((state) => state.items);
	const columns = useKanbanStore((state) => state.columns);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [celebration, setCelebration] = useState<Point | null>(null);

	useQuery({
		queryKey: charactersQueryKey,
		queryFn: fetchCharacters,
	});

	const totalItems = Object.keys(items).length;

	return (
		<div className="min-h-dvh">
			<div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
				<header className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
					<div className="max-w-md space-y-3">
						<h1 className="flex items-center gap-2.5 text-3xl font-medium tracking-tight text-foreground">
							<img
								src={logo}
								alt=""
								className="h-[1.15em] w-auto"
							/>
							Healthie
						</h1>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Kanban board
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Badge variant="outline">
							{totalItems} {totalItems === 1 ? "item" : "items"}
						</Badge>
						<Button onClick={() => setDialogOpen(true)}>New item</Button>
					</div>
				</header>

				<Separator className="my-12" />

				<div className="grid items-start gap-8 lg:grid-cols-3">
					{COLUMNS.map((column) => (
						<KanbanColumn
							key={column.id}
							column={column}
							itemIds={columns[column.id]}
							items={items}
							onCelebrate={setCelebration}
						/>
					))}
				</div>
			</div>

			<CreateItemDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
			/>
			<Celebration
				origin={celebration}
				onComplete={() => setCelebration(null)}
			/>
		</div>
	);
}
