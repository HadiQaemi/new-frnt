import { Menu, BookOpenText, Calendar, User, CopyIcon, BookText, Scan, GraduationCap } from 'lucide-react'
import CustomPopover from '../shared/CustomPopover'
import { usePopoverManager } from '@/app/hooks/usePopoverManager'
import TruncatedAbstract from './TruncatedAbstract'
import { useToast } from '@/components/ui/use-toast'
import { helper } from '@/app/utils/helper'
import { useEffect } from 'react'

interface Author {
  name: string
  identifier: string
}

interface ResearchField {
  label: string
  related_identifier: string[]
}

interface Journal {
  label: string
  '@id': string
  type: 'journal'
}

interface Conference {
  label: string
  '@id': string
  type: 'conference'
}

interface Paper {
  name: string
  datePublished: string
  paper_type: 'journal' | 'conference'
  journal?: Journal
  conference?: Conference
  research_field: ResearchField
  authors: Author[]
  identifier: string
}

interface PaperInfoProps {
  paper: any
  onJournalSelect: (journal: Journal | Conference) => void
  onResearchFieldSelect: (field: ResearchField) => void
  onAuthorSelect: (author: Author) => void
}

const PaperInfo: React.FC<PaperInfoProps> = ({
  paper,
  onJournalSelect,
  onResearchFieldSelect,
  onAuthorSelect
}) => {
  const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()
  const renderIdentifiersList = (identifiers: string[]) => {
    if (typeof identifiers !== 'object')
      identifiers = [identifiers]
    return (
      <>
        {identifiers && <div className="mt-2">See also</div>}
        {identifiers && identifiers.map((id, index) => (
          <div key={index} className="mb-1 py-0 px-3">
            <a
              href={id}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all text-[16px] block"
              onClick={(e) => {
                if (e.target instanceof Element && e.target.closest('.overlay-trigger')) {
                  e.stopPropagation()
                  handlePopoverToggle("", false)
                }
              }}
            >
              {helper.cleanString(id)}
            </a>
          </div>
        ))}
      </>
    )
  }
  const { toast } = useToast();
  const copyToClipboard = (rawText: any) => {
    const formattedText = rawText;

    navigator.clipboard.writeText(formattedText)
      .then(() =>
        toast({
          title: "Success!",
          description: "Address copied to clipboard!",
          className: "bg-green-100",
        })
      )
      .catch(() =>
        toast({
          title: "Error!",
          description: "Failed to copy",
          className: "bg-red-100",
        })
      );
  };
  const venue = paper.scientific_venue ? paper.scientific_venue : paper.journal ? paper.journal : paper.conference
  let research_field = null
  if (paper.research_fields !== undefined) {
    research_field = paper.research_fields
    if (Array.isArray(paper.research_fields))
      research_field = paper.research_fields[0]
  }

  useEffect(() => {
    const localJournals = localStorage.getItem('journals') || '[]'
    if (localJournals.length) {
      const storedVenues = JSON.parse(localJournals);
      const updatedVenues = [...storedVenues];
      // if (!storedVenues.some((u: any) => u.id === venue.id)) {
      //   updatedVenues.push({
      //     id: venue.id,
      //     name: venue.label
      //   });
      //   localStorage.setItem('journals', JSON.stringify(updatedVenues))
      // }
    }

    if (research_field) {
      const storedResearchFields = JSON.parse(localStorage.getItem('fields') || '[]');
      const updatedResearchFields = [...storedResearchFields];
      const research_field_id = research_field.research_field_id ? research_field.research_field_id : research_field.id;
      if (!storedResearchFields.some((u: any) => u.id === research_field_id)) {
        updatedResearchFields.push({
          id: research_field_id,
          name: research_field.label
        });
        localStorage.setItem('fields', JSON.stringify(updatedResearchFields))
      }
    }

    if (paper?.authors) {
      const storedAuthors = JSON.parse(localStorage.getItem('authors') || '[]');
      const updatedAuthors = [...storedAuthors];
      paper.authors.forEach((author: any) => {
        const author_id = author.author_id ? author.author_id : author.id;
        if (!storedAuthors.some((u: any) => u.id === author_id)) {
          updatedAuthors.push({
            id: author_id,
            name: author.name
          });
          localStorage.setItem('authors', JSON.stringify(updatedAuthors));
        }
      });
    }
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 bg-[#e7e5e6] p-1.5">
        <div className="flex justify-end inline">
          <a href={paper.reborn_doi} className={`text-shadow-custom text-blue-500 underline text-sm ${paper.reborn_doi.length > 0 ? 'inline' : 'hidden'}`}>{paper.reborn_doi}</a>
          <span className={`text-shadow-custom px-1.5 py-1 ${paper.reborn_doi.length > 0 ? 'inline' : 'hidden'}`}>
            <CopyIcon
              onClick={() => copyToClipboard(paper.reborn_doi)}
              className="h-4 w-4 text-gray-700 hover:text-gray-900 cursor-pointer text-sm"
            />
          </span>
          <span className={`text-shadow-custom pl-1 h-4 leading-4 mt-1 text-sm ${paper.reborn_doi.length > 0 ? 'border-l border-[#555]' : ''}`}>
            {paper.reborn_date}
          </span>
        </div>
      </div>
      <div ref={containerRef} className='bg-[#f8f9fa] p-4'>
        <div className="grid grid-cols-1">
          <h4 className="text-black text-2xl leading-tight mb-2 font-medium">{paper.name}</h4>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12">
            <span className="badge me-2 text-sm">
              <Calendar className="me-1 inline underline" />
              {paper.date_published}
            </span>
            {research_field && (
              <CustomPopover
                id={`popover-${research_field['label']}`}
                subTitle="Show content for "
                title={research_field['label']}
                show={activePopover === research_field['label']}
                onToggle={(show) => handlePopoverToggle(research_field['label'], show)}
                onSelect={() => onResearchFieldSelect(research_field)}
                icon={Menu}
                trigger={
                  <span
                    className="badge cursor-pointer overlay-trigger me-2 mb-2 underline text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePopoverToggle(research_field.label, activePopover !== research_field.label)
                    }}
                  >
                    <Scan className="me-1 inline text-gray-500 w-[1.7rem] h-[1.7rem]" />
                    <GraduationCap className="inline -ml-[25px] w-[0.9rem] text-xs" />
                    <span className='ml-3'>{research_field['label']}</span>
                  </span>
                }
              >
                {renderIdentifiersList(research_field.related_identifier)}
              </CustomPopover>
            )}
            {paper.authors.map((author: any, index: any) => (
              <CustomPopover
                key={`author-${index}`}
                id={`popover-${`${author.name}`}-${index}`}
                subTitle="Show content for "
                title={`${author.name}`}
                show={activePopover === `${author.name}`}
                onToggle={(show) => handlePopoverToggle(`${author.name}`, show)}
                onSelect={() => onAuthorSelect(author)}
                icon={User}
                trigger={
                  <span
                    className={`badge cursor-pointer overlay-trigger me-2 mb-2 underline text-sm ${index < 1 ? 'inline md:inline' : 'hidden sm:hidden md:inline'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePopoverToggle(`${author.name}`, activePopover !== `${author.name}`)
                    }}
                  >
                    <User className="me-1 inline" />
                    {`${author.name}`}
                  </span>
                }
              >
                {renderIdentifiersList(
                  author.orcid && !author.orcid.startsWith('#')
                    ? [author.orcid]
                    : []
                )}
              </CustomPopover>
            ))}
          </div>
        </div>

        <div className='my-4'>
          {paper && <TruncatedAbstract text={paper.abstract} />}
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 sm:col-span-6">
            {venue && (
              <CustomPopover
                id={`popover-${venue.label}`}
                subTitle="Show content for "
                title={venue.label}
                show={activePopover === venue.label}
                onToggle={(show) => handlePopoverToggle(venue.label, show)}
                icon={BookOpenText}
                onSelect={() => onJournalSelect({ ...venue })}
                trigger={
                  <span
                    className="badge cursor-pointer overlay-trigger underline mr-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePopoverToggle(venue.label, activePopover !== venue.label)
                    }}
                  >
                    <BookOpenText className="me-1 inline text-gray-500" />
                    {venue.label}
                  </span>
                }
              >
                {renderIdentifiersList([venue.identifier])}
              </CustomPopover>
            )}
            <div className='text-black inline text-sm'>
              <BookText className="mx-1 inline text-gray-500" />
              {paper.publisher}
            </div>
            <div className='my-1'>
              <a href={paper.dois} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">
                {paper.dois}
              </a>
              <CopyIcon onClick={() => copyToClipboard(paper.dois)} className="inline ml-2 h-4 w-4 text-gray-700 hover:text-gray-900 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default PaperInfo