import React, { useState, useEffect } from 'react';
import { ChevronsDown, ChevronsRight, CopyIcon, ExternalLink } from 'lucide-react';
import { helper } from '@/app/utils/helper';
import Label from './nodes/Label';
import HasInput from './nodes/HasInput';
import HasOutput from './nodes/HasOutput';
import IsImplementedBy from './IsImplementedBy';
import Executes from './nodes/Executes';
import Evaluates from './nodes/Evaluates';
import Level from './nodes/Level';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from 'lodash';
import AddToCartButton from '../cart/AddToCartButton';
import { getTypeFromStorage } from './utils/storage';
import { TreeNodeProps, TypeInfo } from './types';
import { REBORN_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';

const saveTypeToStorage = (nodeKey: string, typeInfo: TypeInfo): void => {
  try {
    const storedData = localStorage.getItem('node-keys');
    const nodeKeys = storedData ? JSON.parse(storedData) : {};
    nodeKeys[nodeKey] = typeInfo;
    localStorage.setItem('node-keys', JSON.stringify(nodeKeys));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const LoadingSpinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
);

const TreeNode: React.FC<TreeNodeProps> = ({
  data,
  handleTreeViewerClick,
  parentOpen = false,
  onConceptSelect,
  onAuthorSelect,
  statement,
  article,
  statementDetails,
  parent = null,
  label = null,
  tooltip = null,
  level = 0,
  color = false
}) => {
  const [isOpen, setIsOpen] = useState(parentOpen === true);
  const [typeInfo, setTypeInfo] = useState<TypeInfo | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (statementDetails) {
      setDetails(statementDetails)
    }
  }, [statementDetails]);

  useEffect(() => {
    const getNodeTypeInfo = debounce(async () => {
      if (!data) return;
      if (!data?.['@type']?.startsWith('doi:')) {
        setError('Invalid @type format');
        return;
      }

      const nodeKey = data['@type']
        .replace('doi:', '')
        .replace('21.T11969/', '');
      const cachedTypeInfo = getTypeFromStorage(nodeKey);
      if (cachedTypeInfo) {
        setTypeInfo(cachedTypeInfo);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/service/type-info?key=${encodeURIComponent(nodeKey)}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const fetchedTypeInfo = await response.json();
        if (fetchedTypeInfo.error) {
          throw new Error(fetchedTypeInfo.error);
        }

        setTypeInfo(fetchedTypeInfo);
        saveTypeToStorage(nodeKey, fetchedTypeInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    getNodeTypeInfo();

    return () => {
      getNodeTypeInfo.cancel();
    };
  }, [data]);

  const toggleNode = () => {
    handleTreeViewerClick()
    setIsOpen(!isOpen)
    // console.log(statementDetails)
    // if (window.location.pathname.includes('/statement/')) {
    //   setIsOpen(!isOpen)
    //   handleTreeViewerClick()
    // } else {
    //   setIsOpen(!isOpen)
    // }
  };

  const hasChildren = data && typeof data === 'object';
  const paddingLeft = level > 1 ? `${(level - 1) * 5}rem` : '1.25rem';

  if (!data) return null;
  let evaluates_evaluates_for = 0
  let level_targets = 0

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

  return (
    <div className="w-full pr-2.5">
      <div className="relative">
        {typeInfo && hasChildren && color && (
          <span className={`bg-[#5b9bd5] absolute -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
            {helper.capitalizeFirstLetter(helper.cleanFirstLetter(statement.type.name))}
          </span>
        )}
        <div
          className={`flex items-center cursor-pointer p-2 transition-all duration-300 ${level ? 'ml-2.5' : ''}`}
          style={{ paddingLeft }}
        >
          <div className='w-[100%]'>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              statement.type && (
                <>
                  <div className="flex gap-2">
                    {hasChildren && !level && !color && (
                      <span
                        className="mt-2 relative flex flex-col group cursor-default"
                      >
                        <div className="transition-transform duration-300">
                          <AddToCartButton
                            statement={statement}
                            article={article}
                            size="sm"
                          />
                        </div>
                        <div className="flex flex-col items-center mt-4 space-y-1">
                          <Link
                            href={`/statement/${statement?._id?.$oid ? statement?._id?.$oid : statement?.statement_id}`}
                            className="text-[#e86161] cursor-pointer hover:text-[#d45454] block"
                          >
                            <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                          </Link>
                          <CopyIcon onClick={() => copyToClipboard(`${REBORN_URL}/statement/${statement?._id?.$oid ? statement?._id?.$oid : statement?._id}`)} className="h-3 !mt-[10px] w-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        </div>
                      </span>
                    )}
                    <div className="flex">
                      {hasChildren && !level && !color && (
                        <div className="ml-2 mt-[0.60rem]">
                          {!isOpen ? (
                            <ChevronsRight className="text-green-500 h-4 w-4 cursor-pointer" onClick={toggleNode} />
                          ) : (
                            <ChevronsDown className="text-red-500 h-4 w-4 cursor-pointer" onClick={toggleNode} />
                          )}
                        </div>
                      )}
                      <Label
                        tooltip={tooltip}
                        parent={parent}
                        typeInfo={typeInfo}
                        onConceptSelect={onConceptSelect}
                        onAuthorSelect={onAuthorSelect}
                        color={color}
                        button={statement.type.name}
                        toggleNode={toggleNode}
                        statement={statement}
                        label={label}
                      />
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
        <div className={`transition-all duration-300 ${isOpen || parentOpen ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'}`}>
          {details !== null && isOpen && (
            <div className="pl-4">
              {
                details.data_type.map((data_type: {
                  type: {
                    name: string;
                    properties: string[]
                  };
                  has_part: any;
                  is_implemented_by: any;
                }) => {
                  let evaluates = true
                  let level_targets = true
                  return (
                    <div key={`data-type-${data_type.type.name}-${nanoid()}`} className="d-flex p-2 border-t border-r border-b border-[#5b9bd5] border-l-[10px] border-l-[#5b9bd5] my-1 mb-4">
                      <span className={`bg-[#5b9bd5] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        {helper.capitalizeFirstLetter(helper.cleanFirstLetter(data_type.type.name))}
                      </span>
                      <div>
                        {data_type.type.properties?.map((type) => {
                          return (
                            <div key={`property-${type}-${nanoid()}`}>
                              {type === 'has_input' ? (
                                <div className="mx-0 pt-4" key={`has_input-all-${nanoid()}`}>
                                  <div key={`has_input-parent-${nanoid()}`} className="p-2 border-t border-r border-b border-[#00b050] border-l-[10px] border-l-[#00b050] my-1 relative scrollbar-custom sm:overflow-visible overflow-auto">
                                    <span className={`bg-[#00b050] absolute -top-[12px] text-[12px] -left-[10px] p-[2px] text-white pl-4 pr-2`}>
                                      Input data
                                    </span>
                                    {data_type.has_part[type]?.map((input: any) => (
                                      <div
                                        key={`entry-${input.label}-${nanoid()}`}
                                        className="d-flex pb-2"
                                      >
                                        <HasInput has_input={input} label={input.label} key={`has_input-${input.label}-${nanoid()}`} components={[]} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : type === 'has_output' ? (
                                <div className="mx-0 pt-4" key={`has_output-all-${nanoid()}`}>
                                  <div key={`has_output-parent-${nanoid()}`} className="p-2 border-t border-r border-b border-[#00b050] border-l-[10px] border-l-[#00b050] my-1 relative scrollbar-custom sm:overflow-visible overflow-auto">
                                    <span className={`bg-[#00b050] absolute -top-[12px] text-[12px] -left-[10px] p-[2px] text-white pl-4 pr-2`}>
                                      Output data
                                    </span>
                                    {data_type.has_part[type]?.map((input: any) => (
                                      <div
                                        key={`entry-${input.label}-${nanoid()}`}
                                        className="d-flex pb-2"
                                      >
                                        <HasOutput has_output={input} label={input.label} key={`has_input-${input.label}-${nanoid()}`} statement={[]} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : type === 'executes' ? (
                                data_type.has_part[type] && (
                                  <Executes executes={data_type.has_part[type][0]} key={`executes-${type}-${nanoid()}`} />
                                )
                              ) : (type === 'evaluates' || type === 'evaluates_for') ? (
                                (() => {
                                  if (evaluates) {
                                    evaluates = false
                                    return (data_type.has_part[type] && (
                                      <Evaluates evaluates={data_type.has_part['evaluates']} evaluates_for={data_type.has_part['evaluates_for']} key={`evaluates-${type}-${nanoid()}`} />
                                    ))
                                  }
                                })()
                              ) : (type === 'level' || type === 'targets') ? (
                                (() => {
                                  if (level_targets) {
                                    level_targets = false
                                    return (data_type.has_part[type] && (
                                      // <Evaluates evaluates={data_type.has_part['evaluates']} evaluates_for={data_type.has_part['evaluates_for']} key={`evaluates-${type}`} />
                                      <Level key={`targets-${type}-${nanoid()}`} level={data_type.has_part['level']} targets={data_type.has_part['targets']} components={statement.components} />
                                    ))
                                  }
                                })()
                              ) : type === 'label' ? (
                                (() => {
                                  if (data_type.has_part[type].length) {
                                    return <h5 className="group cursor-default text-black text-[18px] leading-tight mb-2 pb-2 font-medium flex items-center gap-2">
                                      <span className="flex-1 cursor-pointer">{data_type.has_part[type]}</span>
                                    </h5>
                                  }
                                })()
                              ) : (
                                // <>{type}{JSON.stringify(data_type.has_part[type])}</>
                                <></>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              }
              {details.data_type[0].is_implemented_by && details.data_type[0].is_implemented_by.map((implement: any) => {
                return <IsImplementedBy data={implement} key={`is_implemented_by-${level}-${nanoid()}`} />
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface JsonTreeViewerProps {
  jsonData?: any;
  parentOpen?: any;
  handleTreeViewerClick?: any;
  onConceptSelect?: (concept: string) => void;
  onAuthorSelect?: (author: string) => void;
  single?: boolean;
  statement?: any;
  article?: any;
  statementDetails?: any;
}

const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({
  jsonData,
  handleTreeViewerClick,
  onConceptSelect,
  onAuthorSelect,
  parentOpen = false,
  statement = null,
  article = null,
  statementDetails = null,
}) => {
  return (
    <TreeNode
      parentOpen={parentOpen}
      data={jsonData}
      statement={statement}
      article={article}
      statementDetails={statementDetails}
      onConceptSelect={onConceptSelect}
      handleTreeViewerClick={handleTreeViewerClick}
      onAuthorSelect={onAuthorSelect}
    />
  );
};

export default JsonTreeViewer;