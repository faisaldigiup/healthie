import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { charactersQueryOptions } from "#/lib/characters";
import type { Character } from "#/lib/types";
import { useKanbanStore } from "#/stores/kanban";

type CreateItemDialogProps = {
	open: boolean;
	onClose: () => void;
};

export function CreateItemDialog({ open, onClose }: CreateItemDialogProps) {
	const addItem = useKanbanStore((state) => state.addItem);
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<Character | null>(null);
	const [error, setError] = useState<string | null>(null);

	const charactersQuery = useQuery({
		...charactersQueryOptions(),
		enabled: open,
	});

	const filteredCharacters = useMemo(() => {
		const list = charactersQuery.data ?? [];
		const needle = query.trim().toLowerCase();
		if (!needle) return list;
		return list.filter((character) => {
			return (
				character.name.toLowerCase().includes(needle) ||
				character.species.toLowerCase().includes(needle)
			);
		});
	}, [charactersQuery.data, query]);

	function resetForm() {
		setTitle("");
		setNotes("");
		setQuery("");
		setSelected(null);
		setError(null);
	}

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			resetForm();
			onClose();
		}
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextTitle = title.trim();

		if (!nextTitle) {
			setError("A title is required.");
			return;
		}

		if (!selected) {
			setError("Assign a character to continue.");
			return;
		}

		addItem({
			id: crypto.randomUUID(),
			title: nextTitle,
			notes: notes.trim(),
			character: selected,
			createdAt: Date.now(),
		});

		toast.success("Added to To Do");
		handleOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="gap-0 sm:max-w-lg">
				<form onSubmit={handleSubmit}>
					<DialogHeader className="p-6 pb-4">
						<DialogTitle>New item</DialogTitle>
						<DialogDescription>
							Give it a name and assign a Rick and Morty character.
						</DialogDescription>
					</DialogHeader>

					<FieldGroup className="gap-6 px-6 pb-6">
						<Field>
							<FieldLabel htmlFor="item-title">Title</FieldLabel>
							<Input
								id="item-title"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="Review lab notes"
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="item-notes">Notes</FieldLabel>
							<Textarea
								id="item-notes"
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								placeholder="Optional context"
								rows={3}
								className="min-h-20 resize-none"
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="character-search">Character</FieldLabel>
							<Input
								id="character-search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search by name or species"
							/>
							{selected ? (
								<Badge variant="secondary" className="w-fit gap-1.5">
									<Avatar size="sm" className="size-4">
										<AvatarImage src={selected.image} alt="" />
										<AvatarFallback className="text-[8px]">
											{selected.name.slice(0, 1)}
										</AvatarFallback>
									</Avatar>
									{selected.name}
								</Badge>
							) : null}

							{charactersQuery.isPending ? (
								<div className="space-y-2 pt-1">
									{Array.from({ length: 4 }).map((_, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeltion index is not interactive and index is ok since it will not be updated in DOM ever
										<Skeleton key={index} className="h-11 w-full rounded-lg" />
									))}
								</div>
							) : null}

							{charactersQuery.isError ? (
								<Alert>
									<AlertTitle>Couldn’t load characters</AlertTitle>
									<AlertDescription>
										The Rick and Morty API didn’t respond.
									</AlertDescription>
									<AlertAction>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => void charactersQuery.refetch()}
										>
											Retry
										</Button>
									</AlertAction>
								</Alert>
							) : null}

							{charactersQuery.isSuccess ? (
								<ScrollArea className="h-56 rounded-lg border">
									<div className="flex flex-col p-1">
										{filteredCharacters.map((character) => {
											const isSelected = selected?.id === character.id;
											return (
												<Button
													key={character.id}
													type="button"
													variant={isSelected ? "secondary" : "ghost"}
													onClick={() => setSelected(character)}
													className={cn(
														"h-auto justify-start gap-3 px-2 py-2",
														isSelected && "ring-1 ring-primary/30",
													)}
												>
													<Avatar size="sm">
														<AvatarImage src={character.image} alt="" />
														<AvatarFallback>
															{character.name.slice(0, 1)}
														</AvatarFallback>
													</Avatar>
													<span className="min-w-0 flex-1 text-left">
														<span className="block truncate">
															{character.name}
														</span>
														<span className="block truncate text-xs font-normal text-muted-foreground">
															{character.species}
														</span>
													</span>
												</Button>
											);
										})}
										{filteredCharacters.length === 0 ? (
											<Empty className="py-10">
												<EmptyHeader>
													<EmptyTitle>No matches</EmptyTitle>
													<EmptyDescription>
														Try another name or species.
													</EmptyDescription>
												</EmptyHeader>
											</Empty>
										) : null}
									</div>
								</ScrollArea>
							) : null}
						</Field>

						{error ? <FieldError>{error}</FieldError> : null}
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Add to To Do</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
