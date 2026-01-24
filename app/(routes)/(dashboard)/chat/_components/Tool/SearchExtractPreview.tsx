import { ExternalLink } from "lucide-react"
import React from "react"

type Props = {
  type: "webSearch" | "extractWebUrl"
  input: any
  output: any
}

const SearchExtractPreview = React.memo(({ type, input, output }: Props) => {
  const results = output?.data?.results || []
  const isWebSearch = type === "webSearch"

  const headerText = isWebSearch ? `Query: "${input?.query}"` : `URLs: "${input?.urls?.join(", ")}"`
  const countText = isWebSearch ? `Used ${results?.length} sources` : `Found  ${results?.length} pages`
  return (
    <div className="border-border/40 w-full rounded-lg border px-1.5 py-3">
      <p>{headerText}</p>
      <div className="mt-2 pl-2">
        <p className="text-sm font-normal text-blue-500">{countText}</p>
        <ul className="max-h-48 list-disc space-y-1 overflow-y-auto pt-2 pb-4 pl-0">
          {Array.isArray(results) &&
            results?.map((item: any, i: number) => (
              <li key={i}>
                <a
                  href={item?.url}
                  rel="noreferrer"
                  target="_blank"
                  className="flex w-full items-center gap-2 text-blue-500 hover:text-blue-400 hover:underline">
                  {item.favicon && <img src={item.favicon} alt="favicon" className="h-4 w-4 rounded-sm" />}
                  <span className="text-[13px]">{isWebSearch ? item.title : item.url}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
})

SearchExtractPreview.displayName = "SearchExtractPreview"

export default SearchExtractPreview
